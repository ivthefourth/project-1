/* Retrieve the data for a recreation area based on RecAreaID
*  Display the data to a modal on the web page */

import './recreation.css';


// display the data in a modal box
export function retrieveSingleRecArea(recarea) {
    $('.modal-content').empty();
    // retrieve the data using recAreaId
    console.log(recarea);

    // The recreation Area Title
    var recNameText = $("<div id='recNameModal'>").text(recarea.RecAreaName);

    //The published phone number of the area
    var recPhoneText = $("<div id='recPhoneModal'>").text(recarea.RecAreaPhone);

    var recAreaEmail = $("<div id='recEmailModal'>").text(recarea.RecAreaEmail);

    var recAreaLinkTitle = recarea.LINK[0].Title;
    var recAreaUrl = recarea.LINK[0].URL;
    var recAreaLink = $("<a />", {
        href: recAreaUrl,
        text: recAreaLinkTitle,
        target: "_blank",
        id: "recUrlModal"});

    // Append the details of the recarea to the modal
    $('.modal-content').append(recNameText,recPhoneText,recAreaEmail,recAreaLink);

    // RecAreaDescription

    $('.modal-content').append(`<strong><div id='descModal'>Description:</strong> ${recarea.RecAreaDescription}`);

    // Append the Activities to the modal
    $('.modal-content').append("<strong><div id='activityModalHead' class='collection-header'>Activities</div>");
    recarea.ACTIVITY.forEach(function(activity){
        $('.modal-content').append("<ul>");
        $('.modal-content').append("<li id='activityTypeModal'>" + activity.ActivityName);
    })

    // RECAREAADDRESS
    recarea.RECAREAADDRESS.forEach(function(address){
        $('.modal-content').append("<strong><div id='addressHeadModal'>Address");
        $('.modal-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress1);
        $('.modal-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress2);
        $('.modal-content').append(`<div class='addressModal'> ${address.City}, ${address.AddressStateCode} ${address.PostalCode}`);
    })

    // Last step is to open the modal after everything is appended
        $('.modal').modal('open');

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
