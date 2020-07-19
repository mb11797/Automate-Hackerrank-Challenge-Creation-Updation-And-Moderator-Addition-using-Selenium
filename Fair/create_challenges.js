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
