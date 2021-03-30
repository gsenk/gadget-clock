////////////////////////////////////////////////////////////////////////
//
//             Edit by Gasper Senk
//
////////////////////////////////////////////////////////////////////////

// globalne spremenljivke k so že uporabljene
var weekday=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
var playing = false;
var num = 1;
//var gUndockFlag == false;

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function loadMain(){
	// To funkcijo se poklièe takoj ko se gadget naloada, le ta nastavi konstanten background
	// poleg tega pa pogleda nastavitve in docked/undocked mode
	
	checkState();
	System.Gadget.onUndock = checkState;
	System.Gadget.onDock = checkState;		
	settingsChanged(); //pogledam kakšne so nastavitve gadgeta
	document.getElementById("imgBackground").src = "images/background_1.png";
	System.Gadget.settingsUI = "settings.html";
	System.Gadget.onSettingsClosed = settingsClosed; //ko zaprem nastavitve pogledam za spremembe
	// poklièen funkcijo za izris elementov, ki se spreminjajo
	izpis();
	
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function izpis(){
	// Funkcija za izris vseh HTML elementov, ki so vedno prisotni
	// izris tistih k so odvisni od nastavitev je treba še dat posebej
	var danes=new Date();
	hour=danes.getHours();
	min=danes.getMinutes();
	sec=danes.getSeconds();
	var let=danes.getFullYear();
	let = let.toString().slice(2); //odreže prve 2 elementa preè in uporabi samo 3 in naprej
	//pogledam da sta obe dvomestni števili
	min=checktime(min); 
	sec=checktime(sec);
	// h[0] je prva cifra ure, h[1] je druga cifra ure
	izpisSettings();	
	var h=izrisureh(hour); 
	var m=izrisure(min);

	//teli elementi so vedno enablani èe je undocked, za docked še nism niè delal
	//Pri docked bi se pa vidl samo mode, alarm in ura+minute
	document.getElementById("ura1").src="images/"+h[0]; // izris ure
	document.getElementById("ura2").src="images/"+h[1];
	document.getElementById("divider").src="images/dvopicje.png"; // divider med uro in minuto
	document.getElementById("min1").src="images/"+m[0]; // izris minute
	document.getElementById("min2").src="images/"+m[1];
	
	// izpis datuma v mesecu + ime meseca ter zadnji dve letnici
	document.getElementById("datum").innerHTML=danes.getDate()+". "+month[danes.getMonth()]+"&nbsp;&nbsp;"+let;
	// izpis dneva z besedo
	document.getElementById("dan").innerHTML=weekday[danes.getDay()];
	

	// ponovno poklièe sebe èez pol sekunde
	setTimeout("izpis()",500);
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function checktime(i){
	// dodam nièlo èe je ura manj kot 10
	if (i < 10){
		i= "0"+i;
		}
	return i;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function izrisure(i){ 
	// v tej funkciji dobim linke ven z èasov za minute in ure
	var a=Math.floor(i/10);
	var b=i%10;
	var link1=a+".png";
	var link2=b+".png";
	return [link1, link2];
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function izrisureh(i){ 
	// v tej funkciji dobim linke ven z èasov za minute in ure
	var a=Math.floor(i/10);
	if (a==0){a=10}
	var b=i%10;
	var link1=a+".png";
	var link2=b+".png";
	return [link1, link2];
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function checkState()
{
	if(!System.Gadget.docked) 
	{
		undockedState();
	} 
	else if (System.Gadget.docked)
	{
		dockedState(); 
	}
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function dockedState(){ 
	var oBody = document.body.style;
		oBody.width="200px";
		oBody.height="115px";

	document.getElementById("vse").style.width = "200px";
	document.getElementById("sekunda").style.visibility = "hidden";
	document.getElementById("datum").style.visibility = "hidden";
	document.getElementById("dan").style.visibility = "hidden";
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function undockedState(){
	//gUndockFlag = true;
	var oBody = document.body.style;
		oBody.width="245px";
		oBody.height="180px";
		
	document.getElementById("vse").style.width = "245px";
	document.getElementById("sekunda").style.visibility = "visible";
	document.getElementById("datum").style.visibility = "visible";
	document.getElementById("dan").style.visibility = "visible";
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function settingsClosed(event)
{
	if (event.closeAction == event.Action.commit)
	{
		settingsChanged();
	}
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function settingsChanged(){
	mySetting.load();
	spremenjenSettings();
	izpisSettings();
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function spremenjenSettings(){
	if(mySetting.alarmdela){
		document.getElementById("zvonc").src="images/zvonc-dela.png";
		var alarmura=mySetting.alarm_h;// izpiše in odkodira shranjen string v polje
		var alarmmin=mySetting.alarm_m;// je tukaj številka, kar bom uporabo za alarm
		if (alarmura == "" && alarmmin == ""){
			document.getElementById("alarm").innerHTML="--:--";
		}
		else{
			document.getElementById("alarm").innerHTML=alarmura+":"+alarmmin;
		}
	}
	else{
		document.getElementById("zvonc").src="images/zvonc-miruje.png";
		document.getElementById("alarm").innerHTML="";

	}
	num = mySetting.backgrd;
	document.getElementById("imgBackground").src = "images/background_"+num+".png";
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function izpisSettings(){
	if (System.Gadget.Settings.read("SettingsExist")){ // prvo mora obstajat mySetting da lahko kej gledam
		if (hour == parseInt(mySetting.alarm_h) && min == parseInt(mySetting.alarm_m) && sec==00 && sec!=sec1 && mySetting.alarmdela == true){
			//èe sta oba pogoja res potem igram skladbo
			playsong();
		}
	}
	sec1=new Date().getSeconds();
	if(mySetting.kaze_sec){
		document.getElementById("sekunda").innerHTML=sec;	
	}
	else{
		document.getElementById("sekunda").innerHTML="";		
	}

	if(mySetting.ampmmode){
		if(hour<12){
			var novo="AM";
		}
		else {
			var novo="PM";
			hour=hour-12;
		}
		document.getElementById("mode").innerHTML=novo;
	
	}
	else{
		document.getElementById("mode").innerHTML="";
	}
	//treba dodat da še zvoni ko je prava ura.
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function playsong(){
	Player.URL = System.Gadget.Settings.readString("pesem");
	Player.settings.volume = 100;
	Player.Controls.play();
	playing = true;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function gadgetClick(){
	if(playing)
	{
		Player.Controls.stop();
		playing = false;
	}
}







