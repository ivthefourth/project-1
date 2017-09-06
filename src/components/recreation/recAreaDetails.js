
// import {displayRecAreaSummary} from './displayRecAreaSuggestions';

export function retrieveSingleRecArea(recarea) {

    // retrieve the data using recAreaId
    console.log(recarea);

    // display the data in a modal box
state.recreation.filtered.RECDATA[0].showDetails(recAreaId);

}

$(document).ready(function(){

    $('.modal').modal();

 });

 export function displayRecAreaOnClick(recAreaId) {
    // var suggestSumId = $(".suggestionSummary").attr("id");
    // console.log(suggestSumId);

       console.log(recAreaId);
     $("suggestionSummary").on("click", function(){
         // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
         $('.modal').modal('open');
         $('.modal').append(retrieveSingleRecArea(recAreaId));
     })
 }
