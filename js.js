let platform = new H.service.Platform({
    'apikey': '8rZVAxjaLRtxZm87BNROgq7nHm8fakKQx5K8jlxiKns'
});

let defaultLayers = platform.createDefaultLayers();

const map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
        zoom: 6,
        center: {
            lat: 51.158627, lng: 10.445921
        }
    });
map.getBaseLayer().getProvider().setStyle(new H.map.Style(
    'https://heremaps.github.io/maps-api-for-javascript-examples/change-style-at-load/data/dark.yaml',
    'https://js.api.here.com/v3/3.1/styles/omv/'));

const ui = H.ui.UI.createDefault(map, defaultLayers);
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

window.addEventListener('resize', function () {
    map.getViewPort().resize();
});

loadData();

function loadData() {

    $.ajax({
        dataType: "json",
        url: "https://cors-anywhere.herokuapp.com/https://corona.tum.lol",
        success: function(data){
            let featureArray = data.features;
            for (let feature of featureArray) {
                let attribute = feature.attributes;

                let name = attribute.Country_Region;
                let lat = attribute.Lat;
                let lon = attribute.Long_;
                let active_cases = attribute.Active;
                let deaths = attribute.Deaths;
                let estimated_cases = attribute.Estimated;
                let lastUpdated = new Date(attribute.Last_Update);

                let radius = estimated_cases / 10 + 100000;

                addCase(lat, lon, radius, name, active_cases, deaths, estimated_cases, lastUpdated);
            }
        }
    });

}

function addCase(lat, lon, radius, name, active_cases, deaths, estimated_cases, lastUpdated){

    let circle = new H.map.Circle(
        { lat: lat, lng: lon},
        radius,
        {
            style: {
                strokeColor: 'rgba(0, 0, 0, 0.6)',
                lineWidth: 2,
                fillColor: 'rgba(255, 50, 50, 0.5)'
            }
        }
    );
    map.addObject(circle);

    let open = false;
    let bubble = new H.ui.InfoBubble({lng: lon, lat: lat}, {
        content: "<b>" + name + "</b> " +
            "<p>Aktive Fälle (bestätigt): <b>" + active_cases + "</b></p>" +
            "<p>Dunkelziffer: <b>" + estimated_cases + "</b></p>" +
            "<p>Bestätigte Tode: <b>" + deaths + "</b></p>" +
            "<p>Zuletzt aktualisiert: <b>" + lastUpdated.toLocaleString() + "</b></p>"
    });
    bubble.close();
    ui.addBubble(bubble);
    circle.addEventListener('tap', function(){
        if(bubble.getState() === H.ui.InfoBubble.State.OPEN){
            bubble.close();
        }else{
            for(let otherBubbles of ui.getBubbles()){
                otherBubbles.close();
            }
            bubble.open();
        }
    });
}