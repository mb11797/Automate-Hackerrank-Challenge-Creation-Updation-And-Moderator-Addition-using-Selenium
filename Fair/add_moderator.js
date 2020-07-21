let fs = require("fs");
require("chromedriver");

let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile = process.argv[2];
let userToAdd = process.argv[3];

//function banate hi usko call kar diya
(async function(){
    try{
        await loginHelper();
        //******************************Home page********************************
        let dropdown = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"));
        await dropdown.click();
        let adminBtn = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"))
        await adminBtn.click();
        console.log("Admin page reached");
        
        //******************************Manage challenges*************************
        await waitForLoader();
        let lis = await driver.findElements(swd.By.css(".administration header ul li"));
        await lis[1].click();

        let managePageURL = await driver.getCurrentUrl();

        // one by one visit every question and add userToAdd as moderator
        let qIdx = 0;
        let qElement = await getQuestionElement(qIdx, managePageURL);
        while(qElement !== null){
            await handleQuestion(qElement);
            qIdx++;
            qElement = await getQuestionElement(qIdx, managePageURL);
        }
    }
    catch(err){
        console.log(err);
    }
})();

async function loginHelper(){
    //selenium inbuilt
    await driver.manage().setTimeouts({
        implicit:10000,
        pageLoad:10000,
    })
    // buffer credentials
    let bCredentials = await fs.promises.readFile(cFile);
    let myCredentials = JSON.parse(bCredentials);
    let user = myCredentials.user;
    let pwd = myCredentials.password;
    let url = myCredentials.url;

    await driver.get(url);
    // find input-1
    const uNameInputPromise = driver.findElement(swd.By.css("#input-1"));

    //find input-2
    const pwdInputPromise = driver.findElement(swd.By.css("#input-2"));

    let elements = await Promise.all([uNameInputPromise, pwdInputPromise]);
    let uNameWillBeSentPromise = elements[0].sendKeys(user);
    let pwdWillBeSentPromise = elements[1].sendKeys(pwd);
    await Promise.all([uNameWillBeSentPromise, pwdWillBeSentPromise]);
    let sbmtBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
    await sbmtBtn.click();
    console.log("User logged in");
}

async function waitForLoader(){
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}

async function getQuestionElement(qIdx, managePageURL){
    await driver.get(managePageURL);
    let pIdx = parseInt(qIdx / 10);     //pageIndex
    let pQueIdx = qIdx % 10;            //pageQuestionIndex
    console.log(pIdx + " " + pQueIdx);
    
    let paginationBtns = await driver.findElements(swd.By.css(".pagination li"));
    let nextPageBtn = paginationBtns[paginationBtns.length - 2];
    let classOnNextPageBtn = await nextPageBtn.getAttribute("class");
    for(let i=0; i<pIdx; i++){
        if(classOnNextPageBtn !== "disabled"){
            await nextPageBtn.click();
            paginationBtns = await driver.findElements(swd.By.css(".pagination li"));
            nextPageBtn = paginationBtns[paginationBtns.length - 2];
            classOnNextPageBtn = await nextPageBtn.getAttribute("class");
        }
        else{
            return null;
        }
    }
    // console.log(pQueIdx);
    let questionsElements = await driver.findElements(swd.By.css(".backbone.block-center"));
    // console.log(questionsElements.length);
    if(pQueIdx < questionsElements.length){
        return questionsElements[pQueIdx];
    }
    else{
        return null;
    }
}

async function handleQuestion(qElement){
    let qUrl = await qElement.getAttribute("href");
    await driver.get(qUrl);
    await waitForLoader();
    //wait
    // await driver.wait(swd.until.elementLocated(swd.By.css("span.tag")));
    // await driver.wait(swd.until.elementLocated(swd.By.css(".error.tags.span12")));
    await driver.wait(swd.until.elementLocated(swd.By.css(".tags_clear")));
    let tabs = await driver.findElement(swd.By.css("li[data-tab=moderators]"));
    await tabs.click();
    let moderator = await driver.findElement(swd.By.css("#moderator"));
    await moderator.sendKeys(userToAdd);
    await moderator.sendKeys(swd.Key.ENTER);
    let saveBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
    await saveBtn.click();
}