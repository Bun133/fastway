import {
    Client,
    DistanceMatrixResponse,
    TrafficModel,
    TravelMode,
    UnitSystem
} from "@googlemaps/google-maps-services-js";
import {LatLng} from "@googlemaps/google-maps-services-js/dist/common";
import {DistanceMatrixRowElement} from "@googlemaps/google-maps-services-js/src/common";

export class GoogleMapAPI {
    apiKey: string
    client: Client

    constructor(apiKey: string) {
        this.apiKey = apiKey
        this.client = new Client({})
    }

    geoCodeAll(locationStr: string[]): Promise<NamedLatLng | null>[] {
        return locationStr.map(s => this.geoCode(s));
    }

    async geoCode(locationStr: string): Promise<NamedLatLng | null> {
        let res = await this.client.geocode({
            params: {
                key: this.apiKey,
                address: locationStr
            }
        })

        if (res.data.results.length >= 1) {
            let first = res.data.results[0]
            return {
                name: locationStr,
                lat: first.geometry.location.lat,
                lng: first.geometry.location.lng
            }
        } else {
            console.log("[FETAL] Can't find place with name:" + locationStr)
            return null
        }
    }

    async distanceMatrix(from: LatLng[], to: LatLng[]): Promise<DistanceMatrixResponse> {
        return this.client.distancematrix({
            params: {
                origins: from,
                destinations: to,
                mode: TravelMode.driving,
                departure_time: Date.now(),
                key: this.apiKey,
                traffic_model: TrafficModel.best_guess,
                units: UnitSystem.metric,
                language: "ja"
            },
            timeout: 5000//ms
        });
    }

    async namedDistanceMatrix(from: NamedLatLng[], to: NamedLatLng[]): Promise<NamedDistanceMatrix[]> {
        let res: DistanceMatrixResponse = await this.distanceMatrix(from, to)

        let results = new Array<NamedDistanceMatrix>();

        for (let rowI = 0; rowI < res.data.rows.length; rowI++) {
            let originLatLng = from[rowI]
            for (let columnI = 0; columnI < res.data.rows[rowI].elements.length; columnI++) {
                let destinationLatLng = to[columnI]
                results.push({
                    from: originLatLng,
                    to: destinationLatLng,
                    ...res.data.rows[rowI].elements[columnI]
                })
            }
        }

        return results
    }
}


export type NamedLatLng = {
    name: string
} & LatLng

export type NamedDistanceMatrix = { from: NamedLatLng, to: NamedLatLng } & DistanceMatrixRowElement