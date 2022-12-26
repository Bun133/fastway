
export function* permGenerator<T>(arr: T[]): Generator<T[]> {
    if (arr.length == 0) {
        yield []
    }

    for (let i = 0; i < arr.length; i++) {
        const first = arr[i]
        const remain = [...arr]
        remain.splice(i, 1)

        for (const j of permGenerator(remain)) {
            yield [first, ...j]
        }
    }
}

/**
 * 順列生成
 * @param arr
 */
export function perm<T>(arr: T[]): T[][] {
    const generator = permGenerator(arr)
    const count = factorial(arr.length)
    const list = new Array<T[]>()
    for (let i = 0; i < count; i++) {
        list.push(generator.next().value)
    }

    return list
}

/**
 * 階乗
 * @param i
 */
export function factorial(i: number): number {
    let r = 1
    for (let l = i; l > 0; l--) {
        r = r * l
    }

    return r
}