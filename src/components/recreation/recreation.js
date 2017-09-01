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
    + latitudeVal + "&longitude=" + longitudeVal + "&radius=" + radiusVal + "&activity" + activityVal;

    $.ajax({
        url: recQueryURL,
        method: "GET"
    })
    .done(function(recdata){

        var recResults = JSON.stringify(recdata);
        console.log(recdata);

        var str = JSON.stringify(recdata);
        var RecAreaName = recdata.recdata.[0].RecAreaName;
        console.log(RecAreaName);

        // for (var i = 0; i <recdata.length; i++) {
        //
        //     var recResults = JSON.stringify(recdata);
        //
        //     var sugDivClass = $("<div class='suggestionSummary'>");
        //     var recName = recResults[i].RecAreaName;
        //     var recNameText = $("<p>").text(recName);
        //
        //     sugDivClass.append(recNameText);
        //     console.log(`${recNameText} goes here `);
        //
        //     $("#suggestionsList").append(sugDivClass);
        //
        //
        // }

    });
}

recApiQuery(40.37578,-105.50896,10,"14,16");
