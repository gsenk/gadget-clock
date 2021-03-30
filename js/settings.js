var selectArray	= new Array();
var gDropDownPos;
var mySetting = new clockSettings();

function loadSettings(){
	mySetting.load();
	bck.value = mySetting.backgrd;
	showsec.checked = mySetting.kaze_sec;
	ampm.checked = mySetting.ampmmode;
	alarm_dela.checked = mySetting.alarmdela;
	alarm_hour.value = mySetting.alarm_h;
	alarm_min.value = mySetting.alarm_m;
	
	dropDownFromBrowse();	
	songPath.value = mySetting.pesem;
	gDropDownPos = selectArray.length;	
	
	System.Gadget.onSettingsClosing = settingsClosing; // ko zaprem nastavitve se le te shranijo
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function clockSettings(){ 
	this.save = saveSettingToDisk;
	this.load = loadSettingFromDisk;
	
	this.backgrd = 1;
	this.alarm_h = "";
	this.alarm_m = "";
	this.pesem = "";
	this.savedPathCount = 0;
	this.alarmdela = false;
	this.ampmmode = false;
	this.kaze_sec = false;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function loadSettingFromDisk(){
	if (System.Gadget.Settings.read("SettingsExist")){
		this.backgrd = System.Gadget.Settings.read("backgrd"); 
		this.alarmdela = System.Gadget.Settings.read("alarmdela"); //pogleda boolean in ustrzno obkljuka checkbox
		this.ampmmode = System.Gadget.Settings.read("ampmmode");
		this.kaze_sec = System.Gadget.Settings.read("kaze_sec");
		this.alarm_h = unescape(System.Gadget.Settings.readString("alarm_h"));// izpiše in odkodira shranjen string v polje
		this.alarm_m = unescape(System.Gadget.Settings.readString("alarm_m"));// .value je tukaj številka, kar bom uporabo za alarm
		
		this.pesem = System.Gadget.Settings.read("pesem");
		this.savedPathCount	= System.Gadget.Settings.read("savedPathCount");
		
		if(this.savedPathCount > 0){
			for(var i = 0; i < this.savedPathCount; i++){
				var pathName = "savedPath"+i;
				selectArray.push(System.Gadget.Settings.read(pathName));
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function saveSettingToDisk(){
	System.Gadget.Settings.write("SettingsExist", true);
	System.Gadget.Settings.write("backgrd",this.backgrd);
	System.Gadget.Settings.write("alarmdela",this.alarmdela); // da zapiše true ali false
	System.Gadget.Settings.write("ampmmode",this.ampmmode);
	System.Gadget.Settings.write("kaze_sec",this.kaze_sec); 
	System.Gadget.Settings.writeString("alarm_h",escape(this.alarm_h)); // zapiše string, ki ga zakodiramo z escape funkcijo
	System.Gadget.Settings.writeString("alarm_m",escape(this.alarm_m));
	
	System.Gadget.Settings.write("pesem",this.pesem);
	var lastIndex = 0;
	for(var i = 0; i<selectArray.length; i++){
		var pathName = "savedPath" + i;
		System.Gadget.Settings.write(pathName, selectArray[i]);
		lastIndex++;
	}
	System.Gadget.Settings.write("savedPathCount", lastIndex);

}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function saveSettings()
{
	mySetting.backgrd = trim(bck.value, "both");
	mySetting.alarmdela = alarm_dela.checked;
	mySetting.ampmmode = ampm.checked;
	mySetting.kaze_sec = showsec.checked;
	mySetting.alarm_h = alarm_ura;
	mySetting.alarm_m = alarm_minuta;
	mySetting.pesem = songPath.value;
	
	mySetting.save();
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function settingsClosing(event){
	if (event.closeAction == event.Action.commit){
		alarm_ura = trim(alarm_hour.value, "both");
		alarm_minuta = trim(alarm_min.value, "both");
		//oznaèijo ozadje z rumeno èe si narobe vnesel v polje, poleg tega pa prekinejo  zapiranje nastavitev
		if (cifra(alarm_ura)){
			document.getElementById("alarm_hour").style.backgroundColor = "#FFFF00";
			event.cancel = true;
		}
		if (cifra(alarm_minuta)){
			document.getElementById("alarm_min").style.backgroundColor = "#FFFF00";
			event.cancel = true;
		}
		if (velikost(alarm_ura,24)){
			document.getElementById("alarm_hour").style.backgroundColor = "#FFFF00";
			event.cancel = true;
		}
		if (velikost(alarm_minuta,60)){
			document.getElementById("alarm_min").style.backgroundColor = "#FFFF00";
			event.cancel = true;
		}
		if (event.cancel) return;
		if (alarm_minuta!=""){
			if (alarm_minuta.length<2){
				// pogleda dolžino stringa za minute da se lepše izpiše
				alarm_minuta=checktime(alarm_minuta);
				}
			}
		saveSettings();
	}
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function cifra(neki){
	// pogleda da so v stringu samo cifre
	var pat = new RegExp("[^0-9]","i")
	return pat.test(neki);
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function velikost(neki,n){
	// pogleda da v stringu niso prevelike cifre
	var vrednost=parseInt(neki);
	return vrednost>=n;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function checktime(neki){
	// dodam nièlo èe je ura manj kot 10
	var i=parseInt(neki);
	if (i < 10){
		i= "0"+i;
		}
	return i;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function trim(stringIn, removeFrom){ 
	var stringOut = "";
	stringIn = stringIn.toString();
	
	if (stringIn.length > 0)
	{
		switch (removeFrom) 
		{ 
			case "left": 
				stringOut = stringIn.replace(/^\s+/g, ""); 
				break; 
			case "right": 
				stringOut = stringIn.replace(/\s+$/g, ""); 
				break; 
			case "both":

			default:
				stringOut = stringIn.replace(/^\s+|\s+$/g, ""); 
		}
	}
	return stringOut;
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function chooseSound(){
	// izberem ker komad bi rad poslušal za alarm in ga takoj predvaja da lažje oceniš
	var shellitem = System.Shell.chooseFile(true, "Music files:*.mp3;*.wav;*.wma::", "", "");
	if(shellitem!=null){	
		mySetting.pesem = shellitem.path;
		selectArray[gDropDownPos] = shellitem.path;
		
		//player, ki predvaja komad ko ga selectam
		Player.URL = mySetting.pesem;
		Player.settings.volume = 100;
		Player.Controls.play();
		
		//klièem dropdown meni
		dropDownFromBrowse();
	}
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function dropDownFromBrowse(){
	// dinamièno konstruira drop down meni da lahko dodajaš pesmi in pol samo izbiraš med njimi
	var j=0;
	var startPoint = selectArray.length - 1;
	for(var i = startPoint; i >= 0; i--)
	{
		songPath.options[j] = new Option(selectArray[i].replace(/^.*\\/, ''), selectArray[i]); // replace je notr da pokaže samo ime fajla
		j++;
	}
	
	// samodejno dodana z tega root filderja
	var mySong = System.Environment.getEnvironmentVariable("SystemRoot") + "\\Media\\tada.wav"; // nek path do fila z windows folderja
	songPath.options[selectArray.length] = new Option(mySong.replace(/^.*\\/, ''), mySong);
}