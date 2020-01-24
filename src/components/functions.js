const gm = window.google.maps;

export const gmPoint = (Y, X) => {
    return new gm.LatLng(Y, X);
}

export const pointAtDistAndAngle = (P, d, a, Q = null) => {
    // uses gmPoint(Y,X)
    // uses rad(x)
    //if Q=null, angle a is in rad
    //if Q!=null, angle a is in deg
    if (Q != null) {
        a = rad(a);
    }
    let Y = d * Math.cos(a) + P.lat();
    let X = d * Math.sin(a) + P.lng();
    return gmPoint(Y, X);
}

export const rad = angle => {
    return angle * Math.PI / 180;
}

export const deg = angle => {
    return angle * 180 / Math.PI;
}

export const segmentAngle = (P1, P2, Q = null) => {
    //if Q!=null, angle a is returned in rad
    //if Q=null, angle a is returned in deg
    const x1 = P1.lng();
    const y1 = P1.lat();
    const x2 = P2.lng();
    const y2 = P2.lat();
    if (Q === null) {
        return (Math.atan2((x2 - x1), (y2 - y1))) * 180 / Math.PI;
    } else {
        return Math.atan2((x2 - x1), (y2 - y1));
    }
}

export const pad = (num, size) => {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
    // return num;
}

export const coordDistance = (p1, p2) => {
    const dLat = rad(p2.lat() - p1.lat()), dLong = rad(p2.lng() - p1.lng());
    return Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
}

export const haversineDist = (p1, p2) => {
    const R = 6371, a = coordDistance(p1, p2);
    const c = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c.toFixed(3);
}

export const findClosestView = point => {
    console.log('******* findClosestView()');
    return new Promise((resolve, reject) => {
        const service = new gm.StreetViewService();
        service.getPanorama({
                location: point,
                radius: 50,
                source: gm.StreetViewSource.OUTDOOR
            },
            (result, status) => {
                if (status === 'OK') {
                    resolve(result);
                } else {
                    reject(false);
                }
            })
    });
}

export const CoordToAddress = coord => {
    return new Promise((resolve, reject) => {
        const service = new gm.Geocoder();
        service.geocode({'latLng': coord},
            (result, status) => {
                if (status === 'OK') {
                    resolve(result);
                } else {
                    reject(false);
                }
            })
    });
}

export const AddressToCoord = address => {
    return new Promise((resolve, reject) => {
        const service = new gm.Geocoder();
        service.geocode({'address': address},
            (result, status) => {
                if (status === 'OK') {
                    resolve(result);
                } else {
                    reject(false);
                }
            })
    });
}

export const halfwayPoint = (P1, P2) => {
    return gmPoint(
        (P2.lat() + P1.lat()) / 2,
        (P2.lng() + P1.lng()) / 2,
    )
}

export const percWayPoint = (P1, P2, perc) => {
    return gmPoint(
        (P2.lat() - P1.lat()) * perc / 100 + P1.lat(),
        (P2.lng() - P1.lng()) * perc / 100 + P1.lng(),
    )
}

export const random = (a, b) => {
    return Math.floor((Math.random() * b) + a);
}

export const angle_0_360 = angle => {
    let new_angle = angle % 360
    return (new_angle >= 0) ? new_angle : 360 + angle
}

export const angleToCardinal = angle => {
    let cardinal = '';
    if (angle < 22.5) {
        cardinal = 'N'
    } else if (angle < 45 + 22.5) {
        cardinal = 'NE'
    } else if (angle < 90 + 22.5) {
        cardinal = 'E'
    } else if (angle < 135 + 22.5) {
        cardinal = 'SE'
    } else if (angle < 180 + 22.5) {
        cardinal = 'S'
    } else if (angle < 225 + 22.5) {
        cardinal = 'SW'
    } else if (angle < 270 + 22.5) {
        cardinal = 'W'
    } else if (angle < 315 + 22.5) {
        cardinal = 'NW'
    } else {
        cardinal = 'N'
    }
    return cardinal
}