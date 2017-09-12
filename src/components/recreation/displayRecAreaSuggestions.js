import state from '../state/state';

    export function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

        // var breakDiv = "<div class=divider>";
        // $(filteredType).append(breakDiv);

        function telephoneCheck(strPhone){
            // Check that the value we get is a phone number
            var isPhone = new RegExp(/^\+?1?\s*?\(?\d{3}|\w{3}(?:\)|[-|\s])?\s*?\d{3}|\w{3}[-|\s]?\d{4}|\w{4}$/);
            return isPhone.test(strPhone);
            console.log("Phone # is: " + isPhone);
        }

        for (var i = 0; i <recdata.val.length; i++) {

            var recValAlias = recdata.val[i];

            var sugDivClass = $("<ul class='suggestionSummary card' id='areaId-" + recValAlias.id + "'>");

            var recNameText = $("<strong><li card-title>").text(recValAlias.RecAreaName);

            var recPhoneText = $("<li card-content>").text(recValAlias.RecAreaPhone);


            if (telephoneCheck(recValAlias.RecAreaPhone) == true){
                sugDivClass.append(recNameText, recPhoneText);
            } else
                sugDivClass.append(recNameText);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            if (recValAlias.LINK[0] != null) {
                var recAreaLinkTitle = recValAlias.LINK[0].Title;
                var recAreaUrl = recValAlias.LINK[0].URL;
                var recAreaLink = $("<a />", {
                    href: recAreaUrl,
                    text: recAreaLinkTitle,
                    target: "_blank"});

                var recAreaLinkP = $("<li card-content>").append(recAreaLink);
                
                sugDivClass.append(recAreaLinkP);
            } else 
                sugDivClass.append("<li card-content>");

            // Check and see if the link array is empty or not and append if not
            // if (recAreaUrl != null) {
            //     sugDivClass.append(recAreaLinkP);
            //     console.log("appending link");
            // } else
            // sugDivClass.append(recAreaLink);
            //     console.log("NOT appending link");


            $(filteredType).append(sugDivClass);

            sugDivClass.click(recValAlias.showDetails);
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
