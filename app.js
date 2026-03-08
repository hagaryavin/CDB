var showList = document.getElementById("showsList"); 
const url =
  "https://script.google.com/macros/s/AKfycbyiztfyHGcqr8dPB4G-_ruG8IUb2L0d6NJOSuPV5pHEx9oR_KDMwJAHeBsultPxsl48lA/exec"; //deployment url
getData();  
var shows4real = [];//רשימת הסדרות עם הנתונים 
var co4real = [];//רשימת הקרוסאוברים
var franchises = [];//פרנצ'ייזים
var newShow = {};
var newCO = {};
var newFran = {};
var onlyTheName = [];//כל הסדרות אבל רק השמות
function getData() {//נתונים מגוגל שיטס
  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      json.data.shows.forEach((ele) => {
        newShow = {
          title: String(ele.showname),
          star: ele.infiniteearthscanon,
          id: ele.showid,
          network: ele.network,
          summary: ele.summary,
          year: ele.year,
          franchise: ele.franchiseid,
          tmdbID: ele.tmdbid,
          imgSrc: ele.imgsrc
        };
        if (newShow.tmdbID !== "") {//מידע מTMDB
            if (newShow.id.charAt(0) === "S"){
                newShow = detailsFromTMDBtv(newShow);
            }
            if (newShow.id.charAt(0) === "M"){
                newShow = detailsFromTMDBmovie(newShow);
            }
        }
        if(!newShow.imgSrc){
          newShow.imgSrc="https://i.pinimg.com/736x/a7/74/c4/a774c42e46b508961c708248aa37419a.jpg";
        }
        console.log(newShow);

        shows4real.push(newShow);
       // if (newShow.id.charAt(0) === "S"||newShow.id.charAt(0) === "M") {//מכניס שמות סדרות
          onlyTheName.push(newShow.title);
          onlyTheName.sort();
        //}
        var showNameAsOption = document.createElement("option");
        if (newShow.id.charAt(0) === "S"||newShow.id.charAt(0) === "M") {//מכניס לרשימת האפשרויות
          showNameAsOption.value = newShow.title;
        }
        showList.append(showNameAsOption);
      });
      json.data.crossovers.forEach((ele) => {
        newCO = {
          show1ID: ele.show1id,
          show2ID: ele.show2id,
          cross: ele.crossoverdescription,
          type: typeName2Num(ele.crossovertype)//סוג קרוסאובר
        };
        co4real.push(newCO);
      });
      json.data.franchises.forEach((ele) => {
        newFran = { id: ele.franchiseid, name: ele.name };
        franchises.push(newFran);
      });
    });
}

function search1show(showName) {//חיפוש תוכנית לפי שם
  var show = document.getElementById("show");
  removeAllChildNodes(show);
  if (legitShowName(showName) && showName.length > 0) {
    document.getElementById("showName1").value=showName;//שם התוכנית בחיפוש
    viewShow(findShowfromName(showName));// קודם פותח את הפופאפ
    if(getShowIDfromName(showName).charAt(0) === "M"||getShowIDfromName(showName).charAt(0) === "S"){
      viewCrossovers(createShowsCOList(showName));//ומאחורה יש את הקרוסאוברים
    }
  }
}
function search2shows() {//חיפוש קרוס לפי שמות 2 סדרות
  var show = document.getElementById("show");
  removeAllChildNodes(show);
  var showName1 = document.getElementById("showName1").value;
  var showName2 = document.getElementById("showName2").value;
  if (
    legitShowName(showName1) &&
    showName1.length > 0 &&
    legitShowName(showName2) &&
    showName2.length > 0
  ) {
    if (showName1 === showName2) {//אותה סדרה פעמיים
      search1show(showName1);
    } else {
      viewCrossovers(create2showsCOList(showName1, showName2));
    }
  }
}
document.getElementById("searchShow").onclick = function () {
  search1show(document.getElementById("showName1").value);
};
function getShowIDfromName(showName) {
  return findShowfromName(showName).id;
}
function legitShowName(showName) {//בודק ששם באמת בטבלה
  var i;
  for (i = 0; i < onlyTheName.length; i++) {
    if (onlyTheName[i] === showName) {
      return true;
    }
  }
  return false;
}
function createShowsCOList(showName) {//מקבל שם סדרה ומחזיר רשימת קרוסאוברים עם הסדרה
  var showID = getShowIDfromName(showName);
  var COList = [];
  co4real.map((co) => {
    if (co.show1ID === showID || co.show2ID === showID) {
      COList.push(co);
    }
    return co.cross;
  });
  return COList;
}
function create2showsCOList(showName1, showName2) {//מקבל 2 סדרות ומחזיר רשימת קרוסאוברים או ריק
  var show1ID = getShowIDfromName(showName1);
  var show2ID = getShowIDfromName(showName2);
  var COList = [];
  co4real.map((co) => {
    if (
      (co.show1ID === show1ID && co.show2ID === show2ID) ||
      (co.show2ID === show1ID && co.show1ID === show2ID)
    ) {
      COList.push(co);
    }
    return "";
  });
  return COList;
}
function isCOListfull(crossoverList) {
  if (crossoverList.length > 0) {
    return true;
  }
  return false;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function pickAnArrow(COType) {
  if (COType === 2) {
    return "⟷";
  }
  return "⟶";
}
document.getElementById("legend").onclick = function () {//פתיחת המקרא
  document.getElementById("myModal2").style.display = "block";
};
function viewCrossovers(crossoverList) {
  var crossovers = document.getElementById("crossovers");
  removeAllChildNodes(crossovers);
  if (isCOListfull(crossoverList)) {
    crossoverList.map((co) => {//עובר על הרשימה של הקרוסאוברים ומציג אותם בצבעים 
      var crossover = document.createElement("div");
      crossover.style.borderColor = type2color(co.type);
      crossover.classList.add("crossover");
      crossovers.append(crossover);
      var show1 = document.createElement("h2");
      show1.innerHTML = findShowfromID(co.show1ID).title;
      show1.onclick = function () {
        search1show(findShowfromID(co.show1ID).title);//לחיצה על שם סדרה1 מחפש אותה
      };
      crossover.append(show1);
      var arrow = document.createElement("h1");
      arrow.innerHTML = pickAnArrow(co.type);
      arrow.style.color = type2color(co.type);
      crossover.append(arrow);
      var show2 = document.createElement("h2");
      show2.innerHTML = findShowfromID(co.show2ID).title;
      show2.onclick = function () {
        search1show(findShowfromID(co.show2ID).title);//לחיצה על שם סדרה2 מחפש אותה
      };
      crossover.append(show2);
      var details = document.createElement("p");
      details.innerHTML = co.cross;
      crossover.append(details);
      return co.show1;
    });
  } else {
    var message = document.createElement("div");
    message.innerHTML = `<h2> ${"sadly there are no crossovers :/"} </h2>`;
    crossovers.append(message);
  }
}
function findShowfromName(name) {
  var showDetails = {};
  for (var i in shows4real) {
    if (shows4real[i].title === name) {
      showDetails = shows4real[i];
    }
  }
  return showDetails;
}
function findShowfromID(id) {
  var showDetails = {};
  for (var i in shows4real) {
    if (shows4real[i].id === id) {
      showDetails = shows4real[i];
    }
  }
  return showDetails;
}
var prevSearch = document.getElementById("prevSearch");
var nextSearch = document.getElementById("nextSearch");
var search1 = true;
prevSearch.onclick = function () {//מעבר בין סוגי חיפושים
  search1 = search1 ? false : true;
  changeSearch();
};
nextSearch.onclick = function () {//מעבר בין סוגי חיפושים
  search1 = search1 ? false : true;
  changeSearch();
};
function changeSearch() {//שינוי חיפוש
  var otherSearchInput = document.getElementById("showName2");
  if (search1) {
    document.getElementById("info").innerHTML =
      "search a show to see its' crossovers";
    otherSearchInput.style.display = "none";
    document.getElementById("searchShow").onclick = function () {
      search1show(document.getElementById("showName1").value);
    };
  } else {
    document.getElementById("info").innerHTML =
      "search 2 shows to see if they cross";
    otherSearchInput.style.display = "inline-block";
    document.getElementById("searchShow").onclick = function () {
      search2shows();
    };
  }
}
function randomShowName() {
  var randNum = Math.floor(Math.random() * onlyTheName.length);//אקראי לפי כמות השמות
  return onlyTheName[randNum];
}
document.getElementById("random").onclick = function () {
  var randShow = randomShowName();
  search1show(randShow);
};
function detailsFromTMDBtv(showDetails) {//מידע מהרשת על הסדרה
  var updatedShowDetails = showDetails;
  var tmdbID = showDetails.tmdbID;
  var tmdbURL =
    "https://api.themoviedb.org/3/tv/" +
    tmdbID +
    "?api_key=e9d2e8f44b5d1e54fa22022b4a771f6c&language=en-US";
  fetch(tmdbURL)
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      //updatedShowDetails.title = data.name;
      if (data.networks && data.networks.length > 0) {
        updatedShowDetails.network = data.networks[0].name;
      }
      if (data.first_air_date) {
        updatedShowDetails.year = data.first_air_date.slice(0, 4);
      }
      if (data.overview) {
        updatedShowDetails.summary = data.overview;
      }
      if (data.poster_path) {
        updatedShowDetails.imgSrc =
          "https://image.tmdb.org/t/p/w300" + data.poster_path;
      } 
    });
  return updatedShowDetails;
}
function detailsFromTMDBmovie(showDetails) {//מידע מהרשת על הסרט
  var updatedShowDetails = showDetails;
  var tmdbID = showDetails.tmdbID;
  var tmdbURL =
    "https://api.themoviedb.org/3/movie/" +
    tmdbID +
    "?api_key=e9d2e8f44b5d1e54fa22022b4a771f6c&language=en-US";
  fetch(tmdbURL)
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      //updatedShowDetails.title = data.name;
      if (data.production_companies && data.production_companies.length > 0) {
        updatedShowDetails.network = data.production_companies[0].name;
      }
      if (data.release_date) {
        updatedShowDetails.year = data.release_date.slice(0, 4);
      }
      if (data.overview) {
        updatedShowDetails.summary = data.overview;
      }
      if (data.poster_path) {
        updatedShowDetails.imgSrc =
          "https://image.tmdb.org/t/p/w300" + data.poster_path;
      } 
    });
  return updatedShowDetails;
}
function viewShow(showDetails) {//התצוגה של הפופאפ
  var show = document.getElementById("show");
  removeAllChildNodes(show);
  if (showDetails.imgSrc !== "") {
    var poster = document.createElement("img");
    poster.src = showDetails.imgSrc;
    poster.classList = "poster";
    show.append(poster);
  }
  if (showDetails.star === "Yes") {//הכוכב הסגול
    var star = document.createElement("img");
     star.src = "https://i.ibb.co/JkVhX2q/star.png";
    star.classList = "star";
    show.append(star);
  }
  var title = document.createElement("h1");
  title.innerHTML = showDetails.title;
  show.append(title);

  var year = document.createElement("h2");
  year.innerHTML = showDetails.year;
  show.append(year);
  var network = document.createElement("h2");
  network.innerHTML = showDetails.network;
  show.append(network);

  var summary = document.createElement("p");
  summary.innerHTML = showDetails.summary;
  summary.classList = "summary";
  show.append(summary);
  if(showDetails.id.charAt(0) === "B"||showDetails.id.charAt(0) === "C"){
    var connected= document.createElement("div");
    show.append(connected);
    var connectionText = document.createElement("h2");
    if(showDetails.id.charAt(0) === "B"){
      connectionText.innerHTML ="Appearances of "+showDetails.title+":";
    }
    if(showDetails.id.charAt(0) === "C"){
      connectionText.innerHTML ="Shows that participated in "+showDetails.title+":";
    }
    connected.append(connectionText);
    var connectedShow = document.createElement("ul");
    connected.append(connectedShow);
    console.log(findConnectedShows(showDetails.title));
    if (findConnectedShows(showDetails.title).length > 0) {
      findConnectedShows(showDetails.title).map(
        (showConnected) => {//מעבר על כל הסדרות הקשורות
          var otherShowName = document.createElement("li");
          otherShowName.innerHTML = showConnected.name;
          if(showConnected.cross){
            otherShowName.innerHTML+=": "+showConnected.cross;
          }
          otherShowName.style.color = showConnected.color;
          otherShowName.onclick = function () {
            search1show(showConnected.name);//לחיצה על סדרה מהרשימה פותחת את החיפוש
          };
          connected.append(otherShowName);
        }
      );
    }
  }
  if (showDetails.franchise !== "") {
    var franchise = document.createElement("div");
    show.append(franchise);
    var franchiseName = document.createElement("h2");
    franchiseName.innerHTML =
      "part of the " +
      franchiseNamefromID(showDetails.franchise) +
      " franchise";
    franchise.append(franchiseName);
    var franchiseShow = document.createElement("ul");
    franchise.append(franchiseShow);
    if (findFranchiseShows(showDetails.franchise, showDetails).length > 0) {
      franchiseName.innerHTML += " with:";
      findFranchiseShows(showDetails.franchise, showDetails).map(
        (showInFranchise) => {//מעבר על כל שאר הסדרות מאותו פרנצ'ייז
          var otherShowName = document.createElement("li");
          otherShowName.innerHTML = showInFranchise;
          otherShowName.onclick = function () {
            search1show(showInFranchise);//לחיצה על סדרה מהרשימה פותחת את החיפוש
          };
          franchise.append(otherShowName);
          return showInFranchise;
        }
      );
    }
  }
  document.getElementById("myModal").style.display = "block";//תצוגת הפופ אפ
}

function franchiseNamefromID(id) {
  for (var f in franchises) {
    if (franchises[f].id === id) {
      return franchises[f].name;
    }
  }
  return id;
}
function findFranchiseShows(franchise, showClicked) {//מקבל קוד פרנצ'ייז וסדרה ומחזיר את שאר הסדרות
  var showsInFranchise = [];
  for (var i in shows4real) {
    if (
      shows4real[i].franchise === franchise &&
      showClicked.title !== shows4real[i].title//מדלג על הסדרה עצמה
    ) {
      showsInFranchise.push(shows4real[i].title);
    }
  }
  return showsInFranchise;
}

function findConnectedShows(showName) {//מקבל שם סדרה ומחזיר את שמות הסדרות הקשורות
  var showsConnected = [];
  var showId=getShowIDfromName(showName);
  var showsCOs=createShowsCOList(showName);
  for (var i in showsCOs) {
    if (showsCOs[i].show1ID!==showId){
      showsConnected.push({name:findShowfromID(showsCOs[i].show1ID).title,cross:showsCOs[i].cross,color:type2color(showsCOs[i].type)});
    }
    if (showsCOs[i].show2ID!==showId){
      showsConnected.push({name:findShowfromID(showsCOs[i].show2ID).title,cross:showsCOs[i].cross,color:type2color(showsCOs[i].type)});
    }
  }
  return showsConnected;
}

var span = document.getElementById("close");
var modal = document.getElementById("myModal");
span.onclick = function () {
  modal.style.display = "none";
};
window.onclick = function (event) {//לחיצה על הרקע סוגרת פופאפים
  if (event.target === modal || event.target === modal2) {
    modal.style.display = "none";
    modal2.style.display = "none";
  }
};
var span2 = document.getElementById("close2");
var modal2 = document.getElementById("myModal2");
span2.onclick = function () {
  modal2.style.display = "none";
};

function typeName2Num(typeName) {//התאמת סוג למספר
  if (typeName === "ספינאוף") {
    return 1;
  }
  if (typeName === "חפץ או איזכור") {
    return 4;
  }
  if (typeName === "הופעה של דמות") {
    return 3;
  }
  if (typeName === "קרוסאובר רשמי") {
    return 2;
  }
  if (typeName === "alt' cameo") {
    return 6;
  }
  if (typeName === "show within a show") {
    return 5;
  }
  return 7;
}
function type2color(typeNum) {//התאמת מספר לצבע
  if (typeNum === 1) {
    return "yellow";
  }
  if (typeNum === 2) {
    return "red";
  }
  if (typeNum === 3) {
    return "green";
  }
  if (typeNum === 4) {
    return "blue";
  }
  if (typeNum === 5) {
    return "orange";
  }
  if (typeNum === 6) {
    return "violet";
  }
  return "black";
}