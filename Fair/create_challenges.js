let fs = require("fs");
require("chromedriver");

let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile = process.argv[2];
let questionsFile = process.argv[3];

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
        let questions = require(questionsFile);

        console.log(`No of challenges: ${questions.length}`);

        for(let i=0; i<questions.length; i++){
            await driver.get(managePageURL);
            await waitForLoader();
            await createChallenge(questions[i]);
            console.log(`Challenge ${i}`);
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

// implicit ka matlab - agar findElement ko abhi nhn mila element, toh 10 sec ke baad vo dobara try karega
// pageload - hrr ek frontend framework pe bana hua hai, toh vo na ek fw use karta hai backbone.js, aur na usme kaafi saara frontend ke andar oracle load hota rehta hai...isliye pageLoad 10 sec ka laga rakha hai

// NOTE - async fn ka sara code try catch me aayega

async function createChallenge(question){
    let createChallengeBtn = await driver.findElement(swd.By.css(".btn.btn-green.backbone.pull-right"))
    await createChallengeBtn.click();
    await waitForLoader();

    let eLinkArr = ["#name", "textarea.description", "#problem_statement-container .CodeMirror div textarea", "#input_format-container .CodeMirror div textarea", "#constraints-container .CodeMirror div textarea", "#output_format-container .CodeMirror div textarea", ".tagsinput input"];

    let elementsArrayPromise = eLinkArr.map(function(selector){
        return driver.findElement(swd.By.css(selector));
    })

    let elementsArray = await Promise.all(elementsArrayPromise);
    
    await elementsArray[0].sendKeys(question["Challenge Name"]);
    await elementsArray[1].sendKeys(question["Description"]);
    await handleContainer("#problem_statement-container .CodeMirror div", elementsArray[2], question["Problem Statement"]);
    await handleContainer("#input_format-container .CodeMirror div", elementsArray[3], question["Input Format"]);
    await handleContainer("#constraints-container .CodeMirror div", elementsArray[4], question["Constraints"]);
    await handleContainer("#output_format-container .CodeMirror div", elementsArray[5], question["Output Format"]);
    await elementsArray[6].sendKeys(question["Tags"]);
    await elementsArray[6].sendKeys(swd.Key.ENTER);
    let saveBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
    await saveBtn.click();

    // jugaad => parent height
    // div => height => increase (JS execute browser)
    // await driver.executeScript("alert('Amazing'");
    // DOM => dynamically page load content change
}


// pSelector => parentSelector
async function handleContainer(pSelector, container, data){
    // JS parent => height change
    let parentElement = await driver.findElement(swd.By.css(pSelector));
    await driver.executeScript("arguments[0].style.height='10px'", parentElement);
    // send keys
    await container.sendKeys(data);
}