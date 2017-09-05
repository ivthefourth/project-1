import state from '../state/state';

    function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

        for (var i = 0; i <recdata.val.length; i++) {

            var recResults = JSON.stringify(recdata);

            var sugDivClass = $("<div class='suggestionSummary'>");
            var recAreaName = recdata.val[i].RecAreaName;
            var recNameText = $("<p>").text(recAreaName);

            var recAreaPhone = recdata.val[i].RecAreaPhone;
            var recPhoneText = $("<p>").text(recAreaPhone);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            var recAreaLinkTitle = recdata.val[i].LINK[0].Title;
            var recAreaUrl = recdata.val[i].LINK[0].URL;
            var recAreaLink = $("<a />", {
                href: recAreaUrl,
                text: recAreaLinkTitle,
                target: "_blank"});

            var recAreaLinkP = $("<p>").append(recAreaLink);
            sugDivClass.append(recNameText, recAreaPhone, recAreaLinkP);

            $(filteredType).append(sugDivClass);
        }
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
