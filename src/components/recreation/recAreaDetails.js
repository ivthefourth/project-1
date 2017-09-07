/* Retrieve the data for a recreation area based on RecAreaID
*  Display the data to a modal on the web page */

import './recreation.css';


// display the data in a modal box
export function retrieveSingleRecArea(recarea) {
    $('.modal').empty();
    // retrieve the data using recAreaId
    console.log(recarea);

    // The recreation Area Title
    var recAreaName = recarea.RecAreaName;
    var recNameText = $("<div id='recNameModal'>").text(recAreaName);

    //The published phone number of the area
    var recAreaPhone = recarea.RecAreaPhone;
    var recPhoneText = $("<div id='recPhoneModal'>").text(recAreaPhone);

        var recAreaLinkTitle = recarea.LINK[0].Title;
        var recAreaUrl = recarea.LINK[0].URL;
        var recAreaLink = $("<a />", {
            href: recAreaUrl,
            text: recAreaLinkTitle,
            target: "_blank"});

    // Append the name and phone
    $('.modal').append(recNameText,recPhoneText,recAreaLink);

    $('.modal').append("<strong><div id='activityModalHead' class='collection-header'>Activities</div>");
    recarea.ACTIVITY.forEach(function(activity){
        $('.modal').append("<ul>");
        $('.modal').append("<li id='activityTypeModal'>" + activity.ActivityName);
    })

        $('#modal1').modal('open');

}

$(document).ready(function(){

    $('.modal').modal({
        inDuration: 300,
        startingTop: '40%', // Starting top style attribute
        endingTop: '10%'
    });

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
