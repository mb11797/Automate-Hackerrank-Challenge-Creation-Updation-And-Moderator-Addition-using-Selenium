let fs = require('fs');
const { promisify } = require('util');

// Library => callback => promise
function promisify_fs(fname){
    return new Promise(function(resolve, reject){
        fs.readFile(fname, function(err, data){
            if(err){
                reject(err);
            }
            else{
                resolve(data);
            }
        })
    })
}

console.log("Before");
// //Promise way
// function promiseConsumer(){
//     let fWillBeReadPromise = promisify_fs("f1.txt");
//     fWillBeReadPromise.then(function(data){
        // console.log("Data of file 1");
        // console.log(data);
//         return promisify_fs("f2.txt");
//     }).then(function(data){
//         console.log("Data of file 2");
//         console.log(data);
//     }).catch(function(err){
//         console.log(err);
//     })
// }


// //await way
// // await => alternative of then
// //await cannot come without async
async function promiseConsumer(){
    try{
        let fWillBeReadPromise = promisify_fs("f1.txt");
        let data = await fWillBeReadPromise;
        console.log("Data of file 1");
        console.log(data);
        data = await promisify_fs("f2.txt")
        console.log("Data of file 2");
        console.log(data);
    }
    catch(err){
        console.log(err);
    }
}

// NOTE - jo then ke andar ka code hai vo ek await se lekar ke doosre await ke beech me likha jata hai
// NOTE - async fn by default promise return karta hai
// NOTE - Async await me hamesha code try catch me hi likhna hota hai
// NOTE - hamesha aisa code likhna chahiye ki aapka server band na ho kabhi
// NOTE - await bina async ke nhn aa sakta
promiseConsumer();
console.log("After");
