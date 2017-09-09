/* Retrieve the data for a recreation area 
*  Display the data to a modal on the web page */

import './recreation.css';
import state from '../state/state';

var bookMarkItem;
var unsetBookMark;

// display the data in a modal box
export function retrieveSingleRecArea(recarea) {
    $('#modal1-content').empty();
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

    // Append

    // Set/Unset the bookmark item
    bookMarkItem = function(){
        if (recarea.bookmarked === false) {
        state.recreation.addBookmark(recarea);
        // $("#book-mark-btn").attr("i class='material-icons dp48"');
        $("#book-mark-btn").text("star");
        } else {
            $('#book-mark-btn').text("Unbookmark");           
            state.recreation.removeBookmark(recarea);
            console.log("This unsets the bookmark");
        }
    }

    // Remove the bookmark
    // unsetBookMark = function(){
    //     if (state.RecArea.bookedmarked == true) {
    //         state.recreation.removeBookmark(recarea);
    //         $('book-mark-btn').text("Unbookmark");
    //     }
    // }

    // Last step is to open the modal after everything is appended
        $('#modal1').modal('open');

}


$(document).ready(function(){

    $('.modal').modal({
        inDuration: 300,
        startingTop: '40%', // Starting top style attribute
        endingTop: '10%'
    });

    $('#book-mark-btn').click(function(){
         bookMarkItem();
    });

 });


