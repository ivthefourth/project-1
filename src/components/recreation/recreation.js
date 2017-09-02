import './recreation.css';

 export var interestList = [
    {"ActivityName": "BIKING",
     "ActivityID": 5,
     "Emoji": "A"
    },
    {"ActivityName": "CLIMBING",
     "ActivityID": 7,
     "Emoji": "A"
    },
    {"ActivityName": "CAMPING",
     "ActivityID": 9,
     "Emoji": "A"
     },
     {"ActivityName": "HIKING",
      "ActivityID": 14,
      "Emoji": "A"
    },
    {"ActivityName": "PICNICKING",
      "ActivityID": 20,
      "Emoji": "A"
     },
     {"ActivityName": "RECREATIONAL VEHICLES",
      "ActivityID": 23,
      "Emoji": "A"
     },
     {"ActivityName": "VISITOR CENTER",
      "ActivityID": 24,
      "Emoji": "A"
    },
    {"ActivityName": "SWIMMING",
     "ActivityID": 106,
     "Emoji": "A"
    },
    {"ActivityName": "WILDLIFE VIEWING",
     "ActivityID": 26,
     "Emoji": "A"
    },
    {"ActivityName": "HORSEBACK RIDING",
     "ActivityID": 15,
     "Emoji": "A"
    }

]


function recApiQuery(latitudeVal,longitudeVal,radiusVal,activityVal) {

    var recQueryURL = "https://ridb.recreation.gov/api/v1/recareas.json?apikey=2C1B2AC69E1945DE815B69BBCC9C7B19&full&latitude="
    + latitudeVal + "&longitude=" + longitudeVal + "&radius=" + radiusVal + "&activity=" + activityVal;

    $.ajax({
        url: recQueryURL,
        method: "GET"
    })
    .done(function(recdata){

        // Log this to the console so we see what the JSON data looks like
        console.log(recdata);


        for (var i = 0; i <recdata.RECDATA.length; i++) {

            var recResults = JSON.stringify(recdata);

            var sugDivClass = $("<div class='suggestionSummary'>");
            var recAreaName = recdata.RECDATA[i].RecAreaName;
            var recNameText = $("<p>").text(recAreaName);

            var recAreaPhone = recdata.RECDATA[i].RecAreaPhone;
            var recPhoneText = $("<p>").text(recAreaPhone);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            var recAreaLinkTitle = recdata.RECDATA[i].LINK[0].Title;
            var recAreaUrl = recdata.RECDATA[i].LINK[0].URL;
            var recAreaLink = $("<a />", {
                href: recAreaUrl,
                text: recAreaLinkTitle,
                target: "_blank"});

            var recAreaLinkP = $("<p>").append(recAreaLink);
            sugDivClass.append(recNameText, recAreaPhone, recAreaLinkP);

            $("#suggestionsList").append(sugDivClass);


        }

    });
}

recApiQuery(40.37578,-105.50896,10,"14,16");
