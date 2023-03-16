var LocationValidator = (function ()
{
	var map = null;
	var geocoder = null;

	var houseArray = [];
	var schoolArray = [];
	/**
	 * Initialize the app.  Called from google maps. 
	 */
	var init = function()
	{
		geocoder = new google.maps.Geocoder();
		initMap();
		document.getElementById("searchaddress").addEventListener("keyup", onAddressKeyUp);
	}

	/**
	 * Initialize the default state of the map.
	 */
	var initMap = function()
	{
		var latlng = new google.maps.LatLng(43.1320570, -86.1646048);
		var myOptions = {
			zoom: 12,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		map.data.setStyle(function(feature)
		{
			var style;
			var type = feature.getProperty("TYPE");

			if (type == "School")
			{
				color = feature.getProperty("COLOR") || 'magenta';
				style = {fillColor: color, fillOpacity: .4, strokeColor: 'black', strokeWeight: 2, strokeOpacity: .35 };  
			}

			if (type== "County")
			{
				style = {clickable: false, fillOpacity: 0, strokeColor: 'black', strokeWeight: 2, strokeOpacity: 1};
			}
			
			return (style);
		});

		map.data.addListener('click', function(event) {
			Toast.show(event.feature.getProperty('LABEL') + " - " + event.feature.getProperty('DCODE'));
        });
		
		map.data.loadGeoJson('geojson/district/coopersville.geojson');
		map.data.loadGeoJson('geojson/district/grandhaven.geojson');
		map.data.loadGeoJson('geojson/district/holton.geojson');
		map.data.loadGeoJson('geojson/district/monashores.geojson');
		map.data.loadGeoJson('geojson/district/muskegon.geojson');
		map.data.loadGeoJson('geojson/district/muskegonheights.geojson');
		map.data.loadGeoJson('geojson/district/oakridge.geojson');
		map.data.loadGeoJson('geojson/district/orchardview.geojson');
		map.data.loadGeoJson('geojson/district/ravenna.geojson');
		map.data.loadGeoJson('geojson/district/springlake.geojson');
		map.data.loadGeoJson('geojson/district/montague.geojson');
		map.data.loadGeoJson('geojson/district/northmuskegon.geojson');
		map.data.loadGeoJson('geojson/district/reethspuffer.geojson');
		map.data.loadGeoJson('geojson/district/whitehall.geojson');
		map.data.loadGeoJson('geojson/district/fruitport.geojson');

		map.data.loadGeoJson('geojson/county/kent.geojson');
		map.data.loadGeoJson('geojson/county/muskegon.geojson');
		map.data.loadGeoJson('geojson/county/newaygo.geojson');
		map.data.loadGeoJson('geojson/county/oceana.geojson');
		map.data.loadGeoJson('geojson/county/ottawa.geojson');


		addSchoolMarker("Edgewood", 43.132057, -86.1646048);
		addSchoolMarker("Beach", 43.1903286, -86.1627745);
		addSchoolMarker("Shettler", 43.1795991, -86.1911475);
		addSchoolMarker("High School", 43.1295166, -86.1611081);
		addSchoolMarker("Middle School", 43.1321133, -86.1686674);
		centerAroundSchools();
	}

	/**
	 * Add house marker
	 */
	var addHouseMarker = function(place)
	{
		var icon = new google.maps.MarkerImage("images/housepointer.png", new google.maps.Size(22,25), new google.maps.Point(0,0), new google.maps.Point(10,22));
		return addMarker(icon, place.name, place.geometry.location.lat(), place.geometry.location.lng())
	}

	/**
	 * Adds house result to search results
	 */
	var addHouseResult = function(address, county, lat, lng)
	{
		var newLineAddress = address.split(", ").join("<br />");
		var template = `<div class="result">
						<div class="resultIcon">
							<a href="#" title="Lat: ${lat}&#13;Lng: ${lng}" onclick="LocationValidator.panMapTo(${lat}, ${lng});">
								<img src="images/housepointer.png" />
							</a>
						</div>
						<div class="resultInfo">
							${newLineAddress}</span><br />
							${county}
						</div>
					</div>`;

		document.getElementById('results').innerHTML += template;
	}

	/**
	 * Adds school marker to the map
	 */
	var addSchoolMarker = function (text, lat, lng)
	{
		var icon = new google.maps.MarkerImage("images/schoolpointer.png", new google.maps.Size(22,25), new google.maps.Point(0,0), new google.maps.Point(10,22));
		schoolArray.push(addMarker(icon, text, lat, lng));
	}

	/**
	 * Adds generic marker to map.  Use addHouse/addschool.
	 */
	var addMarker = function(icon, text, lat, lng)
	{
		marker = new google.maps.Marker(
		{
			icon:icon,
			title: text,
			position: new google.maps.LatLng(lat, lng),
			map: map
		});
		return marker;
	}

	/**
	 * Add search result and house marker 
	 */
	var addSearchResult = function(place)
	{
		var address = place.formatted_address;
		var lat = place.geometry.location.lat();
		var lng = place.geometry.location.lng();
		var county;

		for(var i = 0; i < place.address_components.length; i++)
		{
			var addressComponent = place.address_components[i];
			if(addressComponent.types.indexOf('administrative_area_level_2')>-1) county = addressComponent.short_name;
		}

		houseArray.push(addHouseMarker(place));
		addHouseResult(address, county, lat, lng);
	}

	// Center  around schools
	function centerAroundSchools()
	{
		var bounds = new google.maps.LatLngBounds();
		for ( var i = 0; i < schoolArray.length; i++ )
		{
			bounds.extend(schoolArray[i].getPosition());
		}
		map.fitBounds(bounds);
	}


	/**
	 * Clear found results
	 */
	var clearResults = function()
	{
		document.getElementById('results').innerHTML = "";
		centerAroundSchools();
		if(houseArray)
		{
			for(i in houseArray)
			{
				houseArray[i].setMap(null);
			}
			houseArray.length = 0;
		}
	}

	/**
	 * Pans map to lat lng location
	 */
	var panMapTo = function(lat, lng)
	{
		map.panTo(new google.maps.LatLng({lat: lat, lng: lng}));
	}

	/**
	 * Search for an address.  Parse results and show.
	 */
	var search = function(address)
	{
		clearResults();
		geocoder.geocode({ address: address }, onGeocodeSearch);
	}


	///////////////////////////////////////////////////////////////////////////////////
	// EVENTS
	///////////////////////////////////////////////////////////////////////////////////

	var onAddressKeyUp = function(e)
	{
		if(e.keyCode==13)
		{
			var searchtext = document.getElementById("searchaddress").value;
			search(searchtext);
		}
	}

	var onGeocodeSearch = function(results, status)
	{
		if (status == google.maps.GeocoderStatus.OK)
		{
			for (var i = 0; i < results.length; i++)
			{
				addSearchResult(results[i]);
				if(i==results.length-1) map.panTo(results[i].geometry.location);

			}
		}	
	}


	///////////////////////////////////////////////////////////////////////////////////
	// PUBLIC METHODS
	///////////////////////////////////////////////////////////////////////////////////
	return {
		init: init,
		panMapTo: panMapTo
	};

})();

var Toast = (function ()
{
	var id = null;

	var show = function(msg)
	{
		toast = document.getElementById("toast");
		toast.innerHTML = msg;
		clear();
		toast.className = "show";
		id = setTimeout(clear, 3000);
	}

	var clear = function()
	{
		if(id) clearTimeout(id);
		id = null;
		toast.className = toast.className.replace("show", "");
	}

	return {
		show: show,
		clear: clear
	};
})();