import './recAreaDetails';

export function retrieveSingleRecArea(recarea) {

    // retrieve the data using recAreaId
    console.log(recarea);

    // display the data in a modal box
state.recreation.filtered.RECDATA[0].showDetails(suggestSumId);

}

$(document).ready(function(){

    $('.modal').modal('open');

    function displayRecAreaOnClick() {
       var suggestSumId = $(".suggestionSummary").attr("id");
       console.log(suggestSumId);

        $("#"+suggestSumId).on("click", function(){
            // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
            $('.modal').modal('open');

        })
    }

 });
