async function myFn(){

    // return => promise
    // myFn => returns nothing => Promise(undefined)
    // myFn => returns value => Promise(value)
    // myFn => returns promise => promise

    // return "ashjdkjdk";
    // return null;
    // return true;
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve(10);
        }, 1000);
    })
}

console.log(myFn());
myFn().then(function(data){
    console.log(data);
})