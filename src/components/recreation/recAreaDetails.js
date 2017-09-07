/* Retrieve the data for a recreation area based on RecAreaID
*  Display the data to a modal on the web page */


export function retrieveSingleRecArea(recarea) {
    $('.modal').empty();
    // retrieve the data using recAreaId
    console.log(recarea);

    var recAreaName = recarea.RecAreaName;
    var recNameText = $("<div>").text(recAreaName);

    var recAreaPhone = recarea.RecAreaPhone;
    var recPhoneText = $("<p>").text(recAreaPhone);

    $('.modal').append(recNameText,recPhoneText);

    recarea.ACTIVITY.forEach(function(activity){
        $('.modal').append(activity.ActivityName);
    })

        $('#modal1').modal('open');
    // display the data in a modal box
// state.recreation.filtered.RECDATA[0].showDetails(recAreaId);

}

$(document).ready(function(){

    $('.modal').modal();

 });

 // export function displayRecAreaOnClick(recAreaId) {
 //    // var suggestSumId = $(".suggestionSummary").attr("id");
 //    // console.log(suggestSumId);
 //
 //       console.log(recAreaId);
 //     $(".suggestionSummary").on("click", function(){
 //         // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
 //         $('.modal').modal('open');
 //         $('.modal').append(retrieveSingleRecArea(recAreaId));
 //     })
 // }
