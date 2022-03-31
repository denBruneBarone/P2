function timeInterval(){
    var dateStringStart = document.getElementByCl(startTime).valueAsNumber
    var dateStringStart = document.getElementById(startTime).valueAsNumber

    console.log("dateStringStart")
    if(dateStringEnd < dateStringStart){
        alert("End date cannot be less than the start date!")
        return false
    }

    //Bruges til displayData function
}

function authApi(){
    //Mulighed for at authenticate APIs, hvis man ikke havde gjort det før
    //Toggle buttons til ikke authenticated er disabled indtil da
}

function toggleApi(btn_id){

    if(document.getElementById(btn_id).value == "enabled"){
        document.getElementById(btn_id).value = "disabled"
        document.getElementById(btn_id).style = 'border-color: red'
        //Add function til at stoppe afsending af data i box
    }
    else if (document.getElementById(btn_id).value == "disabled"){
        document.getElementById(btn_id).value = "enabled"
        document.getElementById(btn_id).style = 'border-color: #27af49'
        //Add function til at sende data i box
    }
}