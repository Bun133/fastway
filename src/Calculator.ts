import {NamedDistanceMatrix, NamedLatLng} from "./GoogleMapAPI";

/**
 * この経路に必要な時間を計算する
 * @param target
 * @param routes
 */
export function calculate(target: NamedLatLng[], routes: NamedDistanceMatrix[]): CalculateResult {
    let duration = 0
    let duration_traffic = 0
    let distance = 0
    let fare = 0
    let currency = ""
    for (let i = 0; i < target.length - 1; i++) {
        const from = target[i]
        const to = target[i + 1]

        const bR = betweenRoute(from, to, routes)

        duration += bR.duration.value
        duration_traffic += bR.duration_in_traffic.value
        distance += bR.distance.value
        if (bR.fare) {
            fare += bR.fare.value
            currency = bR.fare.currency
        }
    }

    return {
        from: target[0],
        waypoints: target.slice(1, target.length - 1),
        to: target[target.length - 1],
        duration: {
            value: duration,
            text: "調整中"
        },
        duration_in_traffic: {
            value: duration_traffic,
            text: "調整中"
        },
        distance: {
            value: distance,
            text: "調整中"
        },
        fare: {
            value: fare,
            text: "調整中",
            currency: currency
        },
        // @ts-ignore
        status: "OK"
    }
}

export type CalculateResult = { waypoints: NamedLatLng[] } & NamedDistanceMatrix

function betweenRoute(from: NamedLatLng, to: NamedLatLng, routes: NamedDistanceMatrix[]): NamedDistanceMatrix {
    const entries = routes.filter(e => e.from.name == from.name && e.to.name == to.name)
    if (entries.length == 1) {
        return entries[0]
    }

    throw Error("Route File Broken")
}