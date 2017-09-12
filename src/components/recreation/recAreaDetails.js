/* Retrieve the data for a recreation area 
*  Display the data to a modal on the web page */

import './recreation.css';
import state from '../state/state';

var bookMarkItem;
var unsetBookMark;
var addRecToRoute;

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

    // Check and see if the link array is empty or not 
    if (recarea.LINK[0] != null) {
        var recAreaLinkTitle = recarea.LINK[0].Title;
        var recAreaUrl = recarea.LINK[0].URL;
        var recAreaLink = $("<a />", {
            href: recAreaUrl,
            text: recAreaLinkTitle,
            target: "_blank",
            id: "recUrlModal"});
    }

            function telephoneCheck(strPhone){
              // Check that the value we get is a phone number
                var isPhone = new RegExp(/^\+?1?\s*?\(?\d{3}|\w{3}(?:\)|[-|\s])?\s*?\d{3}|\w{3}[-|\s]?\d{4}|\w{4}$/);
                return isPhone.test(strPhone);
                console.log("Phone # is: " + isPhone);
            }

    // Append the details of the recarea to the modal
    // Checks whether a phone number matches a pattern before appending to the modal
    if (telephoneCheck(recarea.RecAreaPhone) == true){    
        $('#modal1-content').append(recNameText,recPhoneText,recAreaEmail,recAreaLink);
    } else
        $('#modal1-content').append(recNameText,recAreaEmail,recAreaLink);

    // RecAreaDescription

    $('#modal1-content').append(`<strong><div id='descModal'>Description:</strong> ${recarea.RecAreaDescription}`);

    // Append the Activities to the modal
    $('#modal1-content').append("<strong><div id='activityModalHead' class='collection-header'>Activities</div>");
    recarea.ACTIVITY.forEach(function(activity){
        $('#modal1-content').append("<ul>");
        $('#modal1-content').append("<li id='activityTypeModal'>" + activity.ActivityName);
    })

    // RECAREAADDRESS
    recarea.RECAREAADDRESS.forEach(function(address){
        $('#modal1-content').append("<strong><div id='addressHeadModal'>Address");
        $('#modal1-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress1);
        $('#modal1-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress2);
        $('#modal1-content').append(`<div class='addressModal'> ${address.City}, ${address.AddressStateCode} ${address.PostalCode}`);
    })


    // Set/Unset the bookmark item
    bookMarkItem = function(){
        if (recarea.bookmarked === false) {
          state.recreation.addBookmark(recarea);
        } else {
            $('#book-mark-btn').text("Unbookmark");           
            state.recreation.removeBookmark(recarea);
        }
    }

        if (recarea.bookmarked === false) {
            $("#book-mark-btn").text("Bookmark");
        } else {
            $('#book-mark-btn').text("Unbookmark");         
        }

   // Need to add a button that adds the recarea to route

    addRecToRoute = function() {
        if(recarea.inRoute === false) {
            state.recreation.addToRoute(recarea);
            console.log("Add to the route");
        } else {
            $('#addToRouteBtn').text("Remove from Route");
            state.recreation.removeFromRoute(recarea);
            console.log("Removed from route");
        }
    }

        if (recarea.inRoute === false) {
            $('#addToRouteBtn').text("Add to Route");
        } else {
            $('#addToRouteBtn').text("Remove from Route");
        }

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

    // Create button to add a route to the modal footer

        var addToRouteButton = $("<a />", {
            href: "#!",
            text: "Add to Route",
            class: "modal-action modal-close waves-effect btn btn-flat right",
            id: "addToRouteBtn"});

        $('.modal-footer').append(addToRouteButton);

    $('#addToRouteBtn').click(function(){
        addRecToRoute();
    })
 
 });

