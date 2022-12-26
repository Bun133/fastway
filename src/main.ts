import {GoogleMapAPI, NamedDistanceMatrix, NamedLatLng} from "./GoogleMapAPI";
import {loadEnv} from "./Env";
import * as fs from "fs/promises";
import {perm} from "./Util";
import {calculate, CalculateResult} from "./Calculator";

async function distanceMatrix(startSpot: string, destinations: string[]) {
    loadEnv()
    let client = new GoogleMapAPI(process.env.GCP_KEY as string)

    let startLatLng: Promise<NamedLatLng | null> = client.geoCode(startSpot)
    let destinationsLatLng: Promise<NamedLatLng | null>[] = client.geoCodeAll(destinations)

    let all: Promise<NamedLatLng | null>[] = new Array<Promise<NamedLatLng | null>>()
    all.push(startLatLng)
    all.push(...destinationsLatLng)

    let allAwaited: Awaited<Promise<NamedLatLng | null>>[] = await Promise.all(all)

    if (allAwaited.some(e => e == null)) {
        console.log("[Failed!] Some Entry is Null")
        return
    } else {
        let allAwaitedNotNull = allAwaited as Awaited<Promise<NamedLatLng>>[]   // Not Null

        let res = await client.namedDistanceMatrix(allAwaitedNotNull, allAwaitedNotNull)

        console.log(res)

        await fs.writeFile("res.json", JSON.stringify({"routes": res, "locations": allAwaitedNotNull}))
    }
}

async function loadJson(): Promise<[NamedDistanceMatrix[], NamedLatLng[]]> {
    let data: any = JSON.parse((await fs.readFile("res.json")).toString())
    const routes = data["routes"] as NamedDistanceMatrix[]
    const locations = data["locations"] as NamedLatLng[]

    return [routes, locations]
}

async function calc() {
    let data = await loadJson()
    let all = perm(data[1]).filter(e => e[0] == data[1][0])

    let allMap = new Map<NamedLatLng[], CalculateResult>()

    all.forEach(e => allMap.set(e, calculate(e, data[0])))

    console.log(allMap)

    let sorted = Array.from(allMap.values()).sort()

    console.log(sorted)

    await fs.writeFile("sorted.json", JSON.stringify(sorted))
}

// distanceMatrix("横浜駅",["東京駅","神奈川駅"])
calc()