// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  //configuracao do email algorithmlda@gmail.com
  firebaseConfig : {
    apiKey: "AIzaSyBLLjs7nH46v3-Z3kwwSJO5OroHqC6_YN8",
    authDomain: "gestaoclinica-ed2f7.firebaseapp.com",
    databaseURL: "https://gestaoclinica-ed2f7.firebaseio.com",
    projectId: "gestaoclinica-ed2f7",
    storageBucket: "",
    messagingSenderId: "442740183403",
    appId: "1:442740183403:web:c36f7bd3be5f0913"
  }


  //configuracao do email joluisiza@gmail.com
  /*firebaseConfig : {
    apiKey: "AIzaSyBLwu-YemYoPMUEiv5wosmGbJOS_hRZjbc",
    authDomain: "gestaoclinica-8efb2.firebaseapp.com",
    databaseURL: "https://gestaoclinica-8efb2.firebaseio.com",
    projectId: "gestaoclinica-8efb2",
    storageBucket: "gestaoclinica-8efb2.appspot.com",
    messagingSenderId: "1066699384913",
    appId: "1:1066699384913:web:8147d459ba9d694fb8b070"
  }*/
};
