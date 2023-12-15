const fs = require('fs');
const parseString = require('xml2js').parseString;



const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const lat1 = deg2rad(coord1.latitude);
    const lon1 = deg2rad(coord1.longitude);
    const lat2 = deg2rad(coord2.latitude);
    const lon2 = deg2rad(coord2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}

const findNearbyOutlets = (req, res) => {
    const userLocation = req.body.location; // Assuming it contains latitude and longitude

    fs.readFile('./asset.kml', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error reading KML file' });
            return;
        }

        parseString(data, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error parsing KML data' });
                return;
            }



            const customerLocation = { latitude: userLocation.lat, longitude: userLocation.lng };
            const placemarks = result.kml.Document[0].Placemark || [];

            let outletsWithDistances = [];

            placemarks.forEach(placemark => {
                let outletLocation;

                if (placemark.Point) {
                    const outletCoordinates = placemark.Point[0].coordinates[0].split(',');
                    outletLocation = {
                        latitude: parseFloat(outletCoordinates[1]),
                        longitude: parseFloat(outletCoordinates[0])
                    };
                    const distance = calculateDistance(customerLocation, outletLocation);
                    outletsWithDistances.push({ outlet: placemark.name[0], distance });
                } else {
                    const coordinatesString = placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates;
                 
                    const coordinatesArray = coordinatesString
                        .join('')
                        .split('\n')
                        .map(coord => coord.trim())
                        .filter(Boolean)
                        .map(coord => {
                            const [lon, lat] = coord.split(',').map(parseFloat);
                            return { lat, lon };
                        });

                    
                    let distance = Infinity
                    for (const coord of coordinatesArray) {
                        let outletLocation = { latitude: coord.lat, longitude: coord.lon }
                        const mndistance = calculateDistance(customerLocation, outletLocation);
                        if (mndistance < distance) {
                            distance = mndistance;
                        }
                    }


                    outletsWithDistances.push({ outlet: placemark.name[0], distance });
                }



            });

            // Sort outlets by distance in ascending order
         
            outletsWithDistances.sort((a, b) => a.distance - b.distance);




            return res.status(200).json({ outletsWithDistances });
        });
    });
}
module.exports = { calculateDistance, findNearbyOutlets }