$(document).ready(function(){
    document.addEventListener('deviceready',onDeviceReady, false);
});
//Dv 450 toefl
// var SO_TU_TRONG_MOT_GOI = 50;
// var SO_LUONG_PACK = 9;
//Dv 140 phrasal v
var SO_TU_TRONG_MOT_GOI = 25;
var SO_LUONG_PACK = 6;
var THAY_DOI;

var level;
var question;
var answer1;
var answer2;
var answer3;
var answerList = [];

var packDivList = [];
var learnPr;
var rememberPr;
var masterPr;
var learnPrBar;
var rememberPrBar;
var masterPrBar;
var learnPrLabel;
var rememberPrLabel;
var masterPrLabel;
// Define new arrays
var tittleArr = [];
var typeArr = [];
var packArr = [];
var meaningArr = [];
var synonymArr = [];
var exampleArr = []; 
var db;
// Biến này để chỉ insert vào db một lần.Sẽ được set giá trị bới local storage
var firsttime = true;

var totalArr = [];
var correctArr = [];
var timeArr = [];
var levelArr = [];

var audioMedia ;
var duration = -1
var is_paused = false;

// standard for up level
var SD_LEARN_TOTAL = 3;
var SD_REMEM_TOTAL = 5;
var SD_MASTER_TOTAL = 10;
var SD_LEARN_PC = 50;
var SD_REMEM_PC = 65;
var SD_MASTER_PC = 80;
// Define pack objs store pack progress info
var pack1 = {learn:0, remem:0, master:0};
var pack2 = {learn:0, remem:0, master:0};
var pack3 = {learn:0, remem:0, master:0};
var pack4 = {learn:0, remem:0, master:0};
var pack5 = {learn:0, remem:0, master:0};
var pack6 = {learn:0, remem:0, master:0};
var pack7 = {learn:0, remem:0, master:0};
var pack8 = {learn:0, remem:0, master:0};
var pack9 = {learn:0, remem:0, master:0};
var packObjArr = [];

var packDiv1,packDiv2,packDiv3,packDiv4,packDiv5,packDiv6,packDiv7,packDiv8,packDiv9;

var packBar1;
var packBar2;
var packBar3;
var packBar4;
var packBar5;
var packBar6;
var packBar7;
var packBar8;
var packBar9;


function onDeviceReady(){

    document.getElementById('expand').style.display='none' 
    document.getElementById('next').style.display='none'

    THAY_DOI = 0;
    // document.getElementById('start_barTittle').innerHTML = "450 Toefl Words";
    document.getElementById('start_barTittle').innerHTML = "140 Most Common Phrasal Verbs";


    // Handle back button
    document.addEventListener("backbutton", onBackKeyDown, false);

    //Set biến firsttime để insert vào database chỉ một lần duy nhất
    localStorage.setItem("firsttime", "true");

    audioMedia = null;
    level = document.getElementById("level");
    question = document.getElementById("questionText");
    answer1 = document.getElementById("answer1");
    answer2 = document.getElementById("answer2");
    answer3 = document.getElementById("answer3");
    learnPr = document.getElementById("learnPr");
    rememberPr = document.getElementById("rememPr");
    masterPr = document.getElementById("masterPr");
    learnPrBar = document.getElementById("learnPrBar");
    rememberPrBar = document.getElementById("rememPrBar");
    masterPrBar = document.getElementById("masterPrBar");
    learnPrLabel = document.getElementById("learnPrLabel");
    rememberPrLabel = document.getElementById("rememPrLabel");
    masterPrLabel = document.getElementById("masterPrLabel");
    answerList.push(answer1);
    answerList.push(answer2);
    answerList.push(answer3);
    packDiv1 = document.getElementById("pack1");
    packDiv2 = document.getElementById("pack2");
    packDiv3 = document.getElementById("pack3");
    packDiv4 = document.getElementById("pack4");
    packDiv5 = document.getElementById("pack5");
    packDiv6 = document.getElementById("pack6");
    packDiv7 = document.getElementById("pack7");
    packDiv8 = document.getElementById("pack8");
    packDiv9 = document.getElementById("pack9");
    packDivList = [packDiv1,packDiv2,packDiv3,packDiv4,packDiv5,packDiv6,packDiv7,packDiv8,packDiv9];
    for (var i = 0; i < SO_LUONG_PACK; i++){
        packDivList[i].style.display='block';
        var pack = {learn:0, remem:0, master:0};
        packObjArr.push(pack);

    }


    db = getDatabase();
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS TABLE1 (id INTEGER PRIMARY KEY AUTOINCREMENT, total INTEGER, correct INTEGER, time INTEGER, level INTEGER)');
    }, databaseError, getItems);    

    parseData();
}


function dropTable(){
    db = getDatabase();
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS TABLE1');
    }, databaseError, dropTableSuccess);    
}

function dropTableSuccess(){
    alert("dropTableSuccess");
    localStorage.setItem("firsttime", "true");
}



// Create a reference to the database
function getDatabase() {
    return window.openDatabase("toefl450db", "1.0", "Toefl 450 Database", 200000);
}

// Insert a record into the database
function insertItem(total, correct, time, level) {
    
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO TABLE1 (total,correct,time, level) VALUES ('+total+', '+correct+', '+time+', '+level+')');
    }, insertError, insertSuccess);
    
}

// Update item
function updateItem(id, total, correct, time, level) {

    // alert("updateItem id: "+id+", total:"+total+",correct: "+correct+", time: "+time+", level: "+level);
    // Chú ý: Vì arr[] bắt đầu bằng 0, nhưng id (primary key) trong DB thì bắt đầu bằng 1.
    // Nên update item đầu tiên (item thứ 0 trong arr[]) thì id tương ứng trong DB phải là 1.
    // Update arr[stt] thì id trong DB là stt+1
    
    db.transaction(function(tx) {
        tx.executeSql('UPDATE TABLE1 SET total = '+total+',correct = '+correct+',time = '+time+', level = '+level+' WHERE id = ' + (id+1));
    }, updateError, updateSuccess);
    
}


// Run a select statement to pull out all records
function getItems() {
    // alert("getItems");
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM TABLE1', [], querySuccess, selectError);
    }, transactionError);
}

function insertSuccess(){
    // alert("insertSuccess");
}

function updateSuccess(){
    // alert("update success");
}

function querySuccess(tx, results){
    // alert("query success "+results.rows.length);
    for (var i = 0; i < results.rows.length; i++) {
        totalArr.push(results.rows.item(i).total);
        correctArr.push(results.rows.item(i).correct);
        timeArr.push(results.rows.item(i).time);
        levelArr.push(results.rows.item(i).level);
    };


    updateBar();
    updateLevelText();
    // showQuestion();

    // hide 'loading text'
    document.getElementById("loading").style.display = 'none'

}

function databaseError(){
    alert("databaseError!");
}
function updateError(error){
    alert("updateError! "+error.code);
}

function transactionError(){
    alert("transactionError!");
}
function selectError(){
    alert("selectError!");
}
function insertError(){
    alert("insertError!");
}

function parseData(){  
    // alert("parseData!");
    if (window.XMLHttpRequest)
     {  // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
     }
    else
     {  // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
     }
        THAY_DOI = 0;
        //450 Toefl
        // xmlhttp.open("GET", "data_450toefl.xml", false);
        //140 Phrasal verb
        xmlhttp.open("GET", "data_140phrasal.xml", false);
        xmlhttp.send();
        xmlDoc=xmlhttp.responseXML;     
        travels = xmlDoc.getElementsByTagName("vocabulary");
        // alert("Vocabulary: "+travels.length);

        
        
        firsttime = localStorage.getItem("firsttime");
        // alert("firsttime: "+firsttime);
        
        
        for(var i=0; i<travels.length; i++){ 
            var tittle = travels[i].getElementsByTagName("tittle")[0].childNodes[0].nodeValue;
            tittleArr.push(tittle);
            meaningArr.push(travels[i].getElementsByTagName("meaning")[0].childNodes[0].nodeValue);
            //Có example khogng
            var ex = travels[i].getElementsByTagName("example");    
            if(ex.length!=0) {
                exampleArr.push(travels[i].getElementsByTagName("example")[0].childNodes[0].nodeValue);
            }else{
                exampleArr.push("no example");
            }
            //Có synonym ko
            var ex2 = travels[i].getElementsByTagName("synonym");
            if(ex2.length!=0) {
                synonymArr.push(travels[i].getElementsByTagName("synonym")[0].childNodes[0].nodeValue);
            }else{
                synonymArr.push("no synonym");
            }
            //Có type ko
            var ex3 = travels[i].getElementsByTagName("type");
            if(ex3.length!=0) {
                typeArr.push(travels[i].getElementsByTagName("type")[0].childNodes[0].nodeValue);
            }else{
                typeArr.push("no type");
            }

            var contentItem = tittle ;
            var contentItem2 = travels[i].getElementsByTagName("meaning")[0].childNodes[0].nodeValue;

            var ul = document.getElementById("list");
            var li = document.createElement("div");
            li.className = "listItem";
            var p1 = document.createElement("p");
            p1.className = "listItemText";
            var node = document.createTextNode(contentItem);
            var p2 = document.createElement("p");
            p2.className = "listItemText2";
            var node2 = document.createTextNode(contentItem2);
            p1.appendChild(node);

            p2.appendChild(node2);
            li.appendChild(p1);
            li.appendChild(p2);
            // li.appendChild(document.createTextNode(contentItem));
            li.id = i
            ul.appendChild(li);
            

            if(firsttime=="true") insertItem(0,0,0,0);

            // if(i<3){
            //     alert("tittle: "+tittleArr[i]+", type: "+typeArr[i]+", pack: "+packArr[i]+", meaning: "+meaningArr[i]);
            // }

        }

        localStorage.setItem("firsttime", "false");
        // alert("firsttime: "+localStorage.getItem("firsttime"));

        // var ul = document.getElementById("list");
        // ul.addEventListener('click', function(e) {
        //     if (e.target.tagName === 'LI'){
        //       alert("Word: "+tittleArr[e.target.id] + ", total: "+totalArr[e.target.id] + ", correct: "+correctArr[e.target.id] + ", time: "+timeArr[e.target.id]);  // Check if the element is a LI
        //     }
        // });


        // showQuestion();
        
}




function showWordList(packNum){
    var start; 
    var end;
    switch(packNum){
        case 0:
            start = 0;
            end = tittleArr.length;
        break;
        default:
            start = (packNum-1)*SO_TU_TRONG_MOT_GOI;
            end = (start + SO_TU_TRONG_MOT_GOI > tittleArr.length)?tittleArr.length: start + SO_TU_TRONG_MOT_GOI;
        // case 1:
        //     start = 0;
        //     end = 50;
        // break;
        // case 2:
        //     start = 50;
        //     end = 100;
        // break;
        // case 3:
        //     start = 100;
        //     end = 150;
        // break;
        // case 4:
        //     start = 150;
        //     end = 200;
        // break;
        // case 5:
        //     start = 200;
        //     end = 250;
        // break;
        // case 6:
        //     start = 250;
        //     end = 300;
        // break;
        // case 7:
        //     start = 300;
        //     end = 350;
        // break;
        // case 8:
        //     start = 350;
        //     end = 400;
        // break;
        // case 9:
        //     start = 400;
        //     end = 440;
        // break;
    }

    // Remove all item
    var list = document.getElementById("list");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    // Readd item
    for(var i=start; i<end; i++){ 
                        
            var tittle = tittleArr[i] ;
            var meaning = meaningArr[i];
            var example = exampleArr[i];
            var synonym = synonymArr[i];
            var level = levelArr[i];
            var levelStatus;
            var levelTextCssClass;
            switch(level){
                case 0:
                levelStatus='Từ Mới' 
                levelTextCssClass = 'listItemText_Level new';
                break;
                case 1:
                levelStatus='Đã Học';
                levelTextCssClass = 'listItemText_Level learned';
                break;
                case 2:
                levelStatus='Đã Nhớ';
                levelTextCssClass = 'listItemText_Level rememed';
                break;
                case 3:
                levelStatus='Đã thành bậc thầy';
                levelTextCssClass = 'listItemText_Level mastered';
                break;
                case 4:
                levelStatus='Bậc Thầy & Không hỏi nữa';
                levelTextCssClass = 'listItemText_Level mastered';
                break;
            }


            var li = document.createElement("div");
            li.className = "listItem";
            var p4 = document.createElement("p");
            p4.className = levelTextCssClass;
            var node4 = document.createTextNode(levelStatus);
            var p1 = document.createElement("p");
            p1.className = "listItemText"
            var node = document.createTextNode(tittle);
            var p2 = document.createElement("p");
            p2.className = "listItemText2";
            var node2 = document.createTextNode('mearning: '+meaning);
            var p3 = document.createElement("p");
            p3.className = "listItemText2";
            var node3 = document.createTextNode('synonym: '+synonym);
            var p5 = document.createElement("p");
            p5.className = "listItemText2";
            var node5 = document.createTextNode('Example: '+example);
            p4.appendChild(node4);
            p1.appendChild(node);
            p2.appendChild(node2);
            p3.appendChild(node3);
            p5.appendChild(node5);
            li.appendChild(p4);
            li.appendChild(p1);
            li.appendChild(p2);
            li.appendChild(p3);
            li.appendChild(p5);
            
            li.id = i
            list.appendChild(li);
            
    }   


}

var stt = 0;
var ran = 0;

function showQuestion(){
    // alert("showQuestion! stt: "+stt );
    

    // reset font size
    document.getElementById('questionText').style.fontSize="45px"
    // hide levelBack button nếu đang visible
    document.getElementById("levelBack").style.visibility='hidden';
    // Hide meaning
    document.getElementById('expand').style.display='none' 
    // hide button next, already, show answer button
    document.getElementById('next').style.display='none' 
    document.getElementById('already').style.display='none' 
    document.getElementById('answer1').style.display='block' 
    document.getElementById('answer2').style.display='block' 
    document.getElementById('answer3').style.display='block' 
    // Reset color of button answer
    for (var i = 0; i < answerList.length; i++) {
        answerList[i].style.background='#ffffff';
        answerList[i].style.color = '#6b6b6b';
        answerList[i].style.textShadow = '0px 0px #6b6b6b'
    }

    
    //Xác định từ được hỏi
    tinhToanStt();
    // stt = stt + 1; 
    // if(stt>=tittleArr.length){stt=0}

    // Nếu từ có level = 4 thì chính là do chủ động bấm 'Không muốn gặp từ này nữa' (update do quá trình học)
    // chỉ update đến level = 3 - master).Do đó sẽ không show từ này.
    if(levelArr[stt]==4) {
        // Show lại câu hỏi với từ khác
        showQuestion();
        // Return 
        return;
    }
    
    //Set content 
    document.getElementById("questionText").innerHTML = tittleArr[stt];
    document.getElementById("meaning").innerHTML = "Định nghĩa: " + (typeArr[stt]!="no type"?typeArr[stt]:"") +" "+ meaningArr[stt];
    if(synonymArr[stt]!='no synonym'){
        document.getElementById("synonym").style.display = 'block';
        document.getElementById("synonym").innerHTML = "Synonym: " + synonymArr[stt];
    }else{
        document.getElementById("synonym").style.display = 'none';
    }
    if(exampleArr[stt]!='no example'){
        document.getElementById("example").style.display = 'block';
        document.getElementById("example").innerHTML = "Ví dụ: " + exampleArr[stt];
    }else{
        document.getElementById("example").style.display = 'none';
    }

    ran = getRandomInt(0,2);
    
    answerList[ran].innerHTML = meaningArr[stt] 
    answerList[ran].onclick = function(){
    
        // Change color of correct
        this.style.background='#9EF957';
        this.style.color='white';
        this.style.textShadow = '0px 0px #ffffff'
        // Play audio
        playAudio();
        
        // Calculate new 'tracking info'
        var total = totalArr[stt] + 1; var correct = correctArr[stt] + 1;
        var d = new Date();
        var timeInMillis = d.getTime();
        // Update data array in current word

        totalArr[stt] = total; correctArr[stt] = correct; timeArr[stt] = timeInMillis;
        // alert(total);
        // Update data in db
        updateItem(stt,total,correct,timeInMillis,levelArr[stt]);
        
        // Hide answer button
        setTimeout(toggle, 750);

        //Update bar 
        updateBar();
        //Update level
        updateLevelText();
    }

    // alert("showQuestion success 2 !");

    for (var i = 0; i < answerList.length; i++) {

        var randWrong = 0;
        if(stt>Math.round(tittleArr.length/2)) {
            randWrong = getRandomInt(0,stt);
        }else{
            randWrong = getRandomInt(stt,tittleArr.length-1);
        }  

        // alert(randWrong);
        if(i!=ran) {
            answerList[i].innerHTML = meaningArr[randWrong]
            answerList[i].onclick = function(){
                // alert("Incorrect");
                answerList[ran].style.background='#9EF957';
                answerList[ran].style.color='white';
                answerList[ran].style.textShadow = '0px 0px #ffffff'
                this.style.background='#ff7b00';
                this.style.color='white';
                this.style.textShadow = '0px 0px #ffffff'


                // Calculate new 'tracking info'
                var total = totalArr[stt] + 1; 
                var d = new Date();
                var timeInMillis = d.getTime();
                // Update data array in current word
                totalArr[stt] = total; timeArr[stt] = timeInMillis;
                // Update data in db
                updateItem(stt,total,correctArr[stt],timeInMillis,levelArr[stt]);    

                // Hide answer button
                setTimeout(toggle, 750);

                //Update bar 
                updateBar();
                //Update level
                updateLevelText();
            }
        }    
    };
    // alert("showQuestion success 3 !");

    for (var i = 0; i < answerList.length; i++) {
        var text = answerList[i].innerHTML;
        answerList[i].innerHTML = (i==0?"a) ":(i==1?"b) ":"c) ")) +text;
    }

    // alert("showQuestion success!");

    updateLevelText();

}

var khoang = 1;
var soLanTrongKhoang = 0;
var chuyenKhoang = false;
function tinhToanStt(){
    // alert("startStt: "+startStt+", endStt: "+endStt);
    

    // Cập nhật câu hỏi đã hỏi trong khoảng
    
    

    // Nếu đã hỏi 10 từ trong 1 'khoảng' thì chuyển qua 'khoảng' tiếp theo
    soLanTrongKhoang++; 
    if(soLanTrongKhoang>10) {
        // alert("chuyenKhoang"); 
        
        
        switch(khoang){
        case 1:khoang=3;break;
        case 3:khoang=2;break;
        case 2:khoang=5;break;
        case 5:khoang=4;break;
        case 4:khoang=1;break;
        }
        // Tính lại stt
        stt = startStt + (khoang-1)*10 - 1;
        // alert("stt: "+stt);
        
        // Reset lại số lần trong khoảng
        soLanTrongKhoang = 1;
        
    }else{
        
        // Nếu số lần trong khoảng chưa quá 10 thì stt tăng 1 để hỏi từ tiếp theo
        stt = stt + 1; 
        // alert("stt: "+stt);
        // Nếu đạt vị trí cuối thì quay về lúc đầu.
        if(stt>=endStt){stt=startStt} 
    }
        // alert("soLanTrongKhoang: "+soLanTrongKhoang);
    
}

function updateLevelText(){
    // alert("updateLevelText !");

    level.style.color = '#8b8b8b' ;
    level.innerHTML = 'New word' ;
    
    // Calculate 
    var total = totalArr[stt];
    var correct = correctArr[stt];
    var correctPercent = (total!=0) ? Math.floor(correct*100/total) : 0;
    // alert("total: "+total+", correct: "+correct+", %: "+correctPercent);
    var lstatus = levelArr[stt];
    // alert("updateLevelText id: "+stt+", lstatus: "+lstatus);
    var learnSd1 = (total>=SD_LEARN_TOTAL) && (correctPercent>=SD_LEARN_PC);
    var rememSd1 = (total>=SD_REMEM_TOTAL) && (correctPercent>=SD_REMEM_PC);
    var masterSd1 = (total>=SD_MASTER_TOTAL) && (correctPercent>=SD_MASTER_PC);

    // Update level 
    var n;
    if(learnSd1){n = 1;}
    if(rememSd1){n = 2;}
    if(masterSd1){n = 3;}
    // Chi update neu level moi > level cu. Vi level co the dc set boi 'tinh nang already' nen
    // co the khien viec update theo chi so se dua level ve gia tri thuc, vo hieu hoa tinh nang 
    // tang level tu tinh nang 'already'

    if (typeof totalArr[stt] != 'undefined' &&
        typeof correctArr[stt] != 'undefined' &&
        typeof timeArr[stt] != 'undefined' &&
        typeof levelArr[stt] != 'undefined') 
    {
        if(n>levelArr[stt]){
            levelArr[stt] = n;
            updateItem(stt,totalArr[stt],correctArr[stt],timeArr[stt],levelArr[stt]);  
        }
      
    }


    var learnSd = learnSd1||(lstatus>=1) ;
    var rememSd = rememSd1||(lstatus>=2);
    var masterSd = masterSd1||(lstatus>=3);
    // alert("learnSt: "+learnSd);

    document.getElementById("levelExpand_p1").innerHTML = "Số lần trả lời: "+total+", số lần đúng: "+correct+", tỉ lệ: "+correctPercent+"%"
    document.getElementById("correctChartBar").style.width = correctPercent + '%'; 

    // Tính toán chỉ tiêu để user đạt cấp độ tiếp theo
    var mustCorrectNextForLearned = Math.max(SD_LEARN_TOTAL-total,Math.floor((SD_LEARN_PC*total/100-correct)/(1-SD_LEARN_PC/100)));
    var mustCorrectNextForRememed = Math.max(SD_REMEM_TOTAL-total,Math.floor((SD_REMEM_PC*total/100-correct)/(1-SD_REMEM_PC/100)));
    var mustCorrectNextForMastered = Math.max(SD_MASTER_TOTAL-total,Math.floor((SD_MASTER_PC*total/100-correct)/(1-SD_MASTER_PC/100)));
    document.getElementById("levelExpand_p2").innerHTML = "Trả lời đúng "+mustCorrectNextForLearned+" lần nữa để đạt mức độ 'Đã Học'"
    
    var alreadyMessage = "Tôi đã biết từ này";
    if(learnSd) {
        level.style.color = '#2d8bc9' ;
        level.innerHTML = 'Đã Học' ;
        alreadyMessage = "Tôi đã có thể nhớ từ này";
        document.getElementById("levelExpand_p2").innerHTML = "Trả lời đúng "+mustCorrectNextForRememed+" lần nữa để đạt mức độ 'Đã Nhớ'"
        document.getElementById("levelExpand_p3").innerHTML = 'Cấp độ: Đã Học';
    }
    if(rememSd) {
        level.style.color = '#ff7b00'
        level.innerHTML = 'Đã Nhớ Được' ;
        alreadyMessage = "Tôi đã thật sự master từ này";
        document.getElementById("levelExpand_p2").innerHTML = "Trả lời đúng "+mustCorrectNextForMastered+" lần nữa để đạt mức độ 'Đã Thành Bậc Thầy'"
        document.getElementById("levelExpand_p3").innerHTML = 'Cấp độ: Đã Nhớ Được';
    }
    if(masterSd){
        level.style.color = '#9EF957'
        level.innerHTML = 'Bậc Thầy' ;
        alreadyMessage = "Đừng hỏi tôi từ này nữa";
        document.getElementById("levelExpand_p2").innerHTML = "Tiếp tục đều đặn ôn lại để luôn là bậc thầy"
        document.getElementById("levelExpand_p3").innerHTML = 'Cấp độ: Bậc Thầy';
    } 
    if(lstatus==4){
        level.style.color = '#9EF957'
        level.innerHTML = 'Bậc Thầy & Không hỏi nữa' ;
        document.getElementById("levelExpand_p3").innerHTML = 'Cấp độ: Bậc Thầy & Không hỏi nữa';
        
    }

    document.getElementById('already').innerHTML=alreadyMessage 
    // alert("updateLevelText success!");
}



function toggle(){
        // document.getElementById('questionText').style.fontSize="25px"
        // thêm animation 
        $('#questionText').animate({fontSize:'25px'},"400");
        // Show meaning
        document.getElementById('expand').style.display='block' 
        // $('#expand').show(200);
        // Show button next, hide answer button
        // Thêm animation
        document.getElementById('next').style.display='block'
        document.getElementById('already').style.display='block' 
        document.getElementById('answer1').style.display='none' 
        document.getElementById('answer2').style.display='none' 
        document.getElementById('answer3').style.display='none' 
        // $('#next').show(500);
        // $('#already').show(500); 
        // $('#answer1').fadeOut(500);
        // $('#answer2').fadeOut(500);
        // $('#answer3').fadeOut(500);
}

var displayLevelExpand = 0;
function levelExpandView(){
    if(displayLevelExpand==0){
        // document.getElementById('levelExpand').style.display='block'
        // Thêm animation
        $('#levelExpand').show(500);
        displayLevelExpand = 1;
    }else{
        // document.getElementById('levelExpand').style.display='none'
        $('#levelExpand').fadeOut(500);
        displayLevelExpand = 0;
    }
}


function already(){
    // alert("already() stt: "+stt+", word: "+tittleArr[stt]);
    var currLevel = levelArr[stt];
    levelArr[stt] = currLevel<4?(currLevel + 1):4;
    
    updateItem(stt,totalArr[stt],correctArr[stt],timeArr[stt],levelArr[stt]);   
    
    updateLevelText();
    updateBar();


    // $('#levelBack').style.visibility = 'visible';
    document.getElementById("levelBack").style.visibility = "visible"; 
    setTimeout(function(){ document.getElementById("levelBack").style.visibility='hidden'; }, 5000);
}

function resetLevel(){
    // alert("reset level");
    levelArr[stt] = 0;
    totalArr[stt] = 0;
    correctArr[stt] = 0;
    
    updateItem(stt,totalArr[stt],correctArr[stt],timeArr[stt],levelArr[stt]);   
    
    updateLevelText();
    updateBar();

    
}

function backLevel(){
    // alert("reset level");
    var currLevel = levelArr[stt];
    levelArr[stt] = currLevel>0?(currLevel - 1):0;
    
    updateItem(stt,totalArr[stt],correctArr[stt],timeArr[stt],levelArr[stt]);   
    
    updateLevelText();
    updateBar();

    // Sau khi back level thì hide button liền để tránh việc user bấm lần nữa
    document.getElementById("levelBack").style.visibility='hidden';
}

function updateBar(){

    resetPackObj();

    var learn = 0;
    var remem = 0;
    var master = 0;

    var learnProgress;
    var rememProgress;
    var masterProgress;

    for (var i = 0; i < tittleArr.length; i++) {
        var total = totalArr[i];
        var correct = correctArr[i];
        var correctPercent = (total!=0) ? Math.floor(correct*100/total) : 0;
        // alert("total: "+total+", correct: "+correct+", %: "+correctPercent);
        var lstatus = levelArr[i];
        // if(lstatus==1) alert("updateBar learned stt: "+i);
        // if(lstatus==2) alert("updateBar rememed stt: "+i);
        // if(lstatus==3) alert("updateBar mastered stt: "+i);
        
        var learnSd = ((total>=SD_LEARN_TOTAL) && (correctPercent>=SD_LEARN_PC))||(lstatus>=1);
        var rememSd = ((total>=SD_REMEM_TOTAL) && (correctPercent>=SD_REMEM_PC))||(lstatus>=2);
        var masterSd = ((total>=SD_MASTER_TOTAL) && (correctPercent>=SD_MASTER_PC))||(lstatus>=3);

        if(learnSd) learn++;
        if(rememSd) remem++;
        if(masterSd) master++;

        var a = Math.floor(i/SO_TU_TRONG_MOT_GOI);
        // var pack = packObjArr[a];
        if(learnSd) packObjArr[a].learn++;
        if(rememSd) packObjArr[a].remem++;
        if(masterSd)packObjArr[a].master++;




        // Calculate for each package
        if(i>=0 && i<=50){
            if(learnSd) pack1.learn++;
            if(rememSd) pack1.remem++;
            if(masterSd) pack1.master++;
        }
        if(i>50 && i<=100){
            if(learnSd) pack2.learn++;
            if(rememSd) pack2.remem++;
            if(masterSd) pack2.master++;
        }
        if(i>100 && i<=150){
            if(learnSd) pack3.learn++;
            if(rememSd) pack3.remem++;
            if(masterSd) pack3.master++;
        }
        if(i>150 && i<=200){
            if(learnSd) pack4.learn++;
            if(rememSd) pack4.remem++;
            if(masterSd) pack4.master++;
        }
        if(i>200 && i<=250){
            if(learnSd) pack5.learn++;
            if(rememSd) pack5.remem++;
            if(masterSd) pack5.master++;
        }
        if(i>250 && i<=300){
            if(learnSd) pack6.learn++;
            if(rememSd) pack6.remem++;
            if(masterSd) pack6.master++;
        }
        if(i>300 && i<=350){
            if(learnSd) pack7.learn++;
            if(rememSd) pack7.remem++;
            if(masterSd) pack7.master++;
        }
        if(i>350 && i<=400){
            if(learnSd) pack8.learn++;
            if(rememSd) pack8.remem++;
            if(masterSd) pack8.master++;
        }
        if(i>400){
            if(learnSd) pack9.learn++;
            if(rememSd) pack9.remem++;
            if(masterSd) pack9.master++;
        }
        
    };

    // for(var j = 0; j < packObjArr.length; j++){
    //     alert(j+": "+packObjArr[j].learn + ", "+packObjArr[j].remem+", "+packObjArr[j].master);
    // }

    pack1 = packObjArr[0];
    pack2 = packObjArr[1];
    pack3 = packObjArr[2];
    pack4 = packObjArr[3];
    pack5 = packObjArr[4];
    pack6 = packObjArr[5];
    //Goi 450 toefl thi activate 3 dong duoi
    // pack7 = packObjArr[6];
    // pack8 = packObjArr[7];
    // pack9 = packObjArr[8];

    THAY_DOI = 0;//Đánh dấu chỗ phải thay đổi khi làm gói từ khác




    learnProgress = Math.floor(learn*100/tittleArr.length);
    rememProgress = Math.floor(remem*100/tittleArr.length);
    masterProgress = Math.floor(master*100/tittleArr.length);
    
    learnPrBar.style.width = learnProgress + '%'; 
    // learnPrLabel.innerHTML = learn * 1 + '%';
    rememberPrBar.style.width = rememProgress + '%'; 
    // rememberPrLabel.innerHTML = remem * 1 + '%';
    masterPrBar.style.width = masterProgress + '%'; 
    // masterPrLabel.innerHTML = master * 1 + '%';
    document.getElementById("learnPrText").innerHTML = "Bạn đã học được "+learn+" từ";
    document.getElementById("rememPrText").innerHTML = "Bạn đã có thể nhớ "+remem+" từ";
    document.getElementById("masterPrText").innerHTML = "Bạn đã trở thành bậc thầy "+master+" từ";

    // Update package progress bar ở page Packages
    // alert("pack1 learn: "+pack1.learn+", remem: "+pack1.remem+", master: "+pack1.master);
     packBar1 = calculatPackBar(pack1.learn, pack1.remem, pack1.master);
    document.getElementById("st1").innerHTML = "Đã học: "+pack1.learn+". Đã nhớ: "+pack1.remem+". Bậc thầy: "+pack1.master;
    document.getElementById("pr1a").style.width = packBar1.learnProgress + '%';
    document.getElementById("pr1b").style.width = packBar1.rememProgress + '%';
    document.getElementById("pr1c").style.width = packBar1.masterProgress + '%';
     packBar2 = calculatPackBar(pack2.learn, pack2.remem, pack2.master);
     document.getElementById("st2").innerHTML = "Đã học: "+pack2.learn+". Đã nhớ: "+pack2.remem+". Bậc thầy: "+pack2.master;
    document.getElementById("pr2a").style.width = packBar2.learnProgress + '%';
    document.getElementById("pr2b").style.width = packBar2.rememProgress + '%';
    document.getElementById("pr2c").style.width = packBar2.masterProgress + '%';
     packBar3 = calculatPackBar(pack3.learn, pack3.remem, pack3.master);
     document.getElementById("st3").innerHTML = "Đã học: "+pack3.learn+". Đã nhớ: "+pack3.remem+". Bậc thầy: "+pack3.master;
    document.getElementById("pr3a").style.width = packBar3.learnProgress + '%';
    document.getElementById("pr3b").style.width = packBar3.rememProgress + '%';
    document.getElementById("pr3c").style.width = packBar3.masterProgress + '%';
     packBar4 = calculatPackBar(pack4.learn, pack4.remem, pack4.master);
     document.getElementById("st4").innerHTML = "Đã học: "+pack4.learn+". Đã nhớ: "+pack4.remem+". Bậc thầy: "+pack4.master;
    document.getElementById("pr4a").style.width = packBar4.learnProgress + '%';
    document.getElementById("pr4b").style.width = packBar4.rememProgress + '%';
    document.getElementById("pr4c").style.width = packBar4.masterProgress + '%';
     packBar5 = calculatPackBar(pack5.learn, pack5.remem, pack5.master);
     document.getElementById("st5").innerHTML = "Đã học: "+pack5.learn+". Đã nhớ: "+pack5.remem+". Bậc thầy: "+pack5.master;
    document.getElementById("pr5a").style.width = packBar5.learnProgress + '%';
    document.getElementById("pr5b").style.width = packBar5.rememProgress + '%';
    document.getElementById("pr5c").style.width = packBar5.masterProgress + '%';
     packBar6 = calculatPackBar(pack6.learn, pack6.remem, pack6.master);
     document.getElementById("st6").innerHTML = "Đã học: "+pack6.learn+". Đã nhớ: "+pack6.remem+". Bậc thầy: "+pack6.master;
    document.getElementById("pr6a").style.width = packBar6.learnProgress + '%';
    document.getElementById("pr6b").style.width = packBar6.rememProgress + '%';
    document.getElementById("pr6c").style.width = packBar6.masterProgress + '%';
     packBar7 = calculatPackBar(pack7.learn, pack7.remem, pack7.master);
     document.getElementById("st7").innerHTML = "Đã học: "+pack7.learn+". Đã nhớ: "+pack7.remem+". Bậc thầy: "+pack7.master;
    document.getElementById("pr7a").style.width = packBar7.learnProgress + '%';
    document.getElementById("pr7b").style.width = packBar7.rememProgress + '%';
    document.getElementById("pr7c").style.width = packBar7.masterProgress + '%';
     packBar8 = calculatPackBar(pack8.learn, pack8.remem, pack8.master);
     document.getElementById("st8").innerHTML = "Đã học: "+pack8.learn+". Đã nhớ: "+pack8.remem+". Bậc thầy: "+pack8.master;
    document.getElementById("pr8a").style.width = packBar8.learnProgress + '%';
    document.getElementById("pr8b").style.width = packBar8.rememProgress + '%';
    document.getElementById("pr8c").style.width = packBar8.masterProgress + '%';
     packBar9 = calculatPackBar(pack9.learn, pack9.remem, pack9.master);
     document.getElementById("st9").innerHTML = "Đã học: "+pack9.learn+". Đã nhớ: "+pack9.remem+". Bậc thầy: "+pack9.master;
    document.getElementById("pr9a").style.width = packBar9.learnProgress + '%';
    document.getElementById("pr9b").style.width = packBar9.rememProgress + '%';
    document.getElementById("pr9c").style.width = packBar9.masterProgress + '%';


    // Nếu đang ở learn page thì update bar 
    if(page = 1) updateProgressBarInLearningPage(packNumber);
}

function resetPackObj(){
     pack1 = {learn:0, remem:0, master:0};
     pack2 = {learn:0, remem:0, master:0};
     pack3 = {learn:0, remem:0, master:0};
     pack4 = {learn:0, remem:0, master:0};
     pack5 = {learn:0, remem:0, master:0};
     pack6 = {learn:0, remem:0, master:0};
     pack7 = {learn:0, remem:0, master:0};
     pack8 = {learn:0, remem:0, master:0};
     pack9 = {learn:0, remem:0, master:0};

    packObjArr = [];
    for (var i = 0; i < SO_LUONG_PACK; i++){
        var pack = {learn:0, remem:0, master:0};
        packObjArr.push(pack);

    }

}

function updateProgressBarInLearningPage(packnumber){
    // alert("updateProgressBarInLearningPage "+packnumber);
    var packBar;
    var pack;
    switch(packnumber) {
    case 1:
        packBar = packBar1;
        pack = pack1;
        break;
    case 2:
        packBar = packBar2;
        pack = pack2;
        break;
    case 3:
        packBar = packBar3;
        pack = pack3;
        break;
    case 4:
        packBar = packBar4;
        pack = pack4;
        break;
    case 5:
        packBar = packBar5;
        pack = pack5;
        break;
    case 6:
        packBar = packBar6;
        pack = pack6;
        break;
    case 7:
        packBar = packBar7;
        pack = pack7;
        break;
    case 8:
        packBar = packBar8;
        pack = pack8;
        break;
    case 9:
        packBar = packBar9;
        pack = pack9;
        break;                            
    default:
        packBar = packBar1;
        pack = pack1;
    }
    // alert("updateProgressBarInLearningPage "+pack+",packBar: "+packBar);
    document.getElementById("learnPrBarPack").style.width = packBar.learnProgress + '%'; 
    document.getElementById("rememPrBarPack").style.width = packBar.rememProgress + '%'; 
    document.getElementById("masterPrBarPack").style.width = packBar.masterProgress + '%'; 
    document.getElementById("learnPrTextPack").innerHTML = "Bạn đã học được "+pack.learn+" từ trong gói từ này";
    document.getElementById("rememPrTextPack").innerHTML = "Bạn đã có thể nhớ "+pack.remem+" từ trong gói từ này";
    document.getElementById("masterPrTextPack").innerHTML = "Bạn đã trở thành bậc thầy "+pack.master+" từ trong gói từ này";
    
}

//  


function calculatPackBar(learn, remem, master){
    var learnProgress = Math.floor(learn*100/SO_TU_TRONG_MOT_GOI);
    var rememProgress = Math.floor(remem*100/SO_TU_TRONG_MOT_GOI);
    var masterProgress = Math.floor(master*100/SO_TU_TRONG_MOT_GOI);

    var obj = {
        learnProgress:  learnProgress,
        rememProgress: rememProgress,
        masterProgress: masterProgress
    };
    return obj;
}


var vocabulary = { 
    tittle : "",
    type :"",
    pack : "",
    meaning: "",
    synonym:"",
    example: ""

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playAudio() {
    
    
    var my_media = new Media('/android_asset/www/correct.mp3',
            // success callback
             onSuccess,
            // error callback
             onError
    );
           // Play audio
    my_media.play();
}

function onSuccess() {
        
        
    audioMedia = null;
    is_paused = false;
    duration = -1;
}

function onError(error) {
    // alert('code: '    + error.code    + '\n' + 
    //         'message: ' + error.message + '\n');
    
    audioMedia = null;
    is_paused = false;
    
}


function stopAudio() {
    if (audioMedia) {
        audioMedia.stop();
        audioMedia.release();
        audioMedia = null;
    }
    
    is_paused = false;
    duration = 0;
}

var showMenu = 0;
function toggleMenu_LearningPage(){
    if(showMenu==0){
        // Thêm animation
        document.getElementById('menu_learningPage').style.display='block'
        // $('#menu').show(500);
        showMenu = 1;
    }else{
        document.getElementById('menu_learningPage').style.display='none'
        // $('#menu').fadeOut(200);
        showMenu = 0;
    }
}
var showMenu_startPage = 0;
function toggleMenu_startPage(){
    if(showMenu_startPage==0){
        document.getElementById('menu_startPage').style.display='block'
        // $('#menu_startPage').show(500);
        showMenu_startPage = 1;
    }else{
        document.getElementById('menu_startPage').style.display='none'
        // $('#menu_startPage').fadeOut(200);
        showMenu_startPage = 0;
    }
}

var page = 0;
function onBackKeyDown() {
    if(page==0) {navigator.app.exitApp();}
    if(page==1) goToStart();
    if(page==2) goToHome();
    
    
}

function goToStart(){
    page = 0;
    $.mobile.navigate( "#start", { transition : "flow", info: "info about the #bar hash" });   
}
function goToList(pack){
    
    // Xác định mở list từ start hay từ pack bởi parameter
    page = (pack==0)?1:2 ;
    var text = (pack==0)?"tất cả từ vựng":("từ vựng của gói số "+pack);
    document.getElementById('p2').innerHTML = text
    $.mobile.navigate( "#about", { transition : "slide", info: "info about the #bar hash" });
    if(pack==0) {
        toggleMenu_startPage();
        document.getElementById('img2').onclick = function(){
        goToStart();
        }
    }else{
        toggleMenu_LearningPage();
        document.getElementById('img2').onclick = function(){
        goToHome();
        }
    }
    showWordList(pack);
}

function goToHome(){
    page = 1;
    $.mobile.navigate( "#home", { transition : "flow", info: "info about the #bar hash" });   
}

function goToContact(){
    page = 1;
    $.mobile.navigate( "#contact", { transition : "flow", info: "info about the #bar hash" });   
    toggleMenu_startPage();
    
}


var startStt;
var endStt;

var packNumber = 1;
function startLearning(pack){
    // alert("startLearning "+pack);
    page = 1;
    packNumber = pack;
    $.mobile.navigate( "#home", { transition : "slide", info: "info about the #bar hash" });
    updateProgressBarInLearningPage(pack);

    startStt = (pack-1)*SO_TU_TRONG_MOT_GOI;
    endStt = (startStt + SO_TU_TRONG_MOT_GOI > tittleArr.length-1)?tittleArr.length-1:(startStt + SO_TU_TRONG_MOT_GOI - 1);

    // switch(pack){
    //     case 1:
    //         startStt=0;
    //         endStt=49;
    //
    //     break;
    //     case 2:
    //         startStt=50;
    //         endStt=99;
    //
    //     break;
    //     case 3:
    //         startStt=100;
    //         endStt=149;
    //
    //     break;
    //     case 4:
    //         startStt=150;
    //         endStt=199;
    //
    //     break;
    //     case 5:
    //         startStt=200;
    //         endStt=249;
    //
    //     break;
    //     case 6:
    //         startStt=250;
    //         endStt=299;
    //
    //     break;
    //     case 7:
    //         startStt=300;
    //         endStt=349;
    //
    //     break;
    //     case 8:
    //         startStt=350;
    //         endStt=399;
    //
    //     break;
    //     case 9:
    //         startStt=400;
    //         endStt=tittleArr.length-1;
    //
    //     break;
    // }

    // Set giá trị ban đầu cho stt
    stt = startStt - 1;// Khi show câu hỏi stt sẽ đc tính lại lần nữa (+1 hoặc tính lại khi chuyển khoảng)

    // alert("startLearning: stt "+stt);
    showQuestion();

    // Set page tittle ghi đang ở pack nào
    // document.getElementById('home_barTittle').innerHTML = "450 Toefl Words - Gói Từ Số "+pack ;
    document.getElementById('home_barTittle').innerHTML = "140 Phrasal Verbs - Gói Từ Số "+pack ;
    THAY_DOI = 0;

    // Set khi click open word list từ learn page thì sẽ mở gói từ thôi
    document.getElementById('menuItem_learnPage').onclick = function(){
        goToList(pack);
    }

}


