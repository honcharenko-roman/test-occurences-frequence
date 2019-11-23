import requests from "request-promise";

export class RandomOrgService {
    private readonly APIKey: string = "4b7ebff0-aa0b-428c-b50c-f5c61b4b8fbe";
    private readonly MaxApiElements: number = 10000;
    private readonly MaxValue: number = 1;
    private readonly MinValue: number = 0;

    // LIMITED TO 1kk BITS BY IP ADDRESS
    public async getNumbersByGetRequest(numberOfNumerals: number): Promise<any> {
        const requestCounter: number = this.determineRequestCounter(numberOfNumerals)[0];
        const remainder: number = this.determineRequestCounter(numberOfNumerals)[1];

        async function asyncRequest(
            apiElements: number,
            APIKey: string,
            MaxValue: number,
            MinValue: number) {
            try {
                const request = await requests({
                    // TODO proxy
                    // proxy: "http://167.71.248.252:1080",
                    url: `https://www.random.org/integers/?num=${apiElements}&min=${MinValue}&max=${MaxValue}&col=1&format=plain&rnd=new&base=10`,
                });
                return request;
            } catch (error) {
                throw new Error(error);
            }
        }

        const promises = [];
        for (let i = 0; i < requestCounter; i++) {
            promises.push(asyncRequest(this.MaxApiElements, this.APIKey, this.MaxValue, this.MinValue));
        }
        if (remainder !== 0) {
            promises.push(asyncRequest(remainder, this.APIKey, this.MaxValue, this.MinValue));
        }

        try {
            const resultArray = await Promise.all(promises)
                .then((numbersStringArray: string[]) => {
                    let sumArray: number[] = [];
                    for (const numberStringArray of numbersStringArray) {
                        const numberArray = Array.from(numberStringArray
                            .replace(/\s/g, ""))
                            .toString().split(",")
                            .map(Number);
                        sumArray = sumArray.concat(numberArray);
                    }
                    return sumArray;
                })
                .catch((e) => {
                    throw new Error(e);
                });
            return resultArray;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @returns     returns a map, containing values and ocurrences count
     */
    public findOverlappingOccurrences(numbers: number[], howMuchInARow: number): Map<string, number> {
        const numbersStringArray: string = numbers.toString().replace(/,/g, "");
        const myMap: Map<string, number> = new Map();
        const howMuchInARowBinary: number = 2 ** howMuchInARow - 1;
        for (let i = 0; i <= howMuchInARowBinary; i++) {
            const val: string = i.toString(2).padStart(howMuchInARow, "0");
            const regex: RegExp = new RegExp("(?=(" + val + "))\\d", "g");
            const localOccurrences = [];
            let match = regex.exec(numbersStringArray);
            while (match !== null) {
                localOccurrences.push(match[1]);
                match = regex.exec(numbersStringArray);
            }
            myMap.set(val, localOccurrences.length);
        }
        return myMap;
    }

    // LIMITED TO 250000 PER DAY BY API LICENCE
    private async getNumbersByApiKey(numberOfNumerals: number): Promise<number[]> {
        const requestCounter: number = this.determineRequestCounter(numberOfNumerals)[0];
        const remainder: number = this.determineRequestCounter(numberOfNumerals)[1];

        async function asyncRequest(
            apiElements: number,
            APIKey: string,
            MaxValue: number,
            MinValue: number) {

            const myJSONObject = {
                id: 23894,
                jsonrpc: "2.0",
                method: "generateIntegers",
                params: {
                    apiKey: APIKey,
                    max: MaxValue,
                    min: MinValue,
                    n: apiElements,
                },
            };

            const rawResponse = await fetch("https://api.random.org/json-rpc/2/invoke", {
                body: JSON.stringify(myJSONObject),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
            });
            const content = await rawResponse.json();
            return content.result.random.data;
        }

        const promises = [];
        for (let i = 0; i < requestCounter; i++) {
            promises.push(asyncRequest(this.MaxApiElements, this.APIKey, this.MaxValue, this.MinValue));
        }
        if (remainder !== 0) {
            promises.push(asyncRequest(remainder, this.APIKey, this.MaxValue, this.MinValue));
        }

        const resultArray = await Promise.all(promises)
            .then((numbersArray: number[][]) => {
                let sumArray: number[] = [];
                for (const numberArray of numbersArray) {
                    sumArray = sumArray.concat(numberArray);
                }
                return sumArray;
            })
            .catch((e) => {
                throw new Error(e);
            });

        return resultArray;
    }

    private determineRequestCounter(numberOfNumerals: number) {
        let requestCounter: number = 0;
        let remainder: number = 0;
        if (numberOfNumerals >= this.MaxApiElements) {
            requestCounter = numberOfNumerals / this.MaxApiElements;
            if (numberOfNumerals % this.MaxApiElements !== 0) {
                requestCounter = Number.parseInt(requestCounter.toString(), 10);
                remainder = numberOfNumerals - this.MaxApiElements * Number.parseInt(requestCounter.toString(), 10);
            }
        } else {
            remainder = numberOfNumerals;
        }
        return [requestCounter, remainder];
    }

}
