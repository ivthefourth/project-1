import state from '../state/state';
import {displayRecAreaOnClick} from  './recAreaDetails';

    export function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

        for (var i = 0; i <recdata.val.length; i++) {

            var recValAlias = recdata.val[i];

            var recResults = JSON.stringify(recdata);

            var sugDivClass = $("<div class='suggestionSummary' id='areaId-" + recValAlias.id + "'>");
            var recAreaName = recValAlias.RecAreaName;
            var recNameText = $("<div>").text(recAreaName);

            var recAreaPhone = recValAlias.RecAreaPhone;
            var recPhoneText = $("<p>").text(recAreaPhone);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            var recAreaLinkTitle = recValAlias.LINK[0].Title;
            var recAreaUrl = recValAlias.LINK[0].URL;
            var recAreaLink = $("<a />", {
                href: recAreaUrl,
                text: recAreaLinkTitle,
                target: "_blank"});

            var recAreaLinkP = $("<p>").append(recAreaLink);
            sugDivClass.append(recNameText, recAreaPhone, recAreaLinkP);

            $(filteredType).append(sugDivClass);

            // Get the RecAreaId and return it to displayRecAreaOnClick
            var recAreaId = [];
            recAreaId.push(recValAlias.id);

        }
            displayRecAreaOnClick();
    }



state.recreation.filtered.on("change",  function(recdata){

        var filteredType = "#filtered";
        displayRecAreaSummary(recdata, filteredType);
});
state.recreation.bookmarked.on("change", function(recdata){

        var filteredType = "#bookmarked";
        displayRecAreaSummary(recdata, filteredType);
});
state.recreation.inRoute.on("change",  function(recdata){

        var filteredType = "#added-to-route";
        displayRecAreaSummary(recdata, filteredType);
});
