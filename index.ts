import { RandomOrgService } from "./randomOrgService";

const randomOrgService: RandomOrgService = new RandomOrgService();
const value: number = 50000;

randomOrgService.getNumbersByGetRequest(value).then((numbers: number[]) => {

  const numberDict: Map<string, number> = randomOrgService.findOverlappingOccurrences(numbers, 2);

  numbers.forEach((arrayElement: number, index: number) => {
    if (index % 50 === 0) {
      document.write("<br/>");
    }
    document.write(arrayElement.toString() + ", ");
  });

  document.write("<br/>");

  numberDict.forEach((value: number, occurenceCount: string) => {
    document.write("Value " + occurenceCount + " occurred " + value.toString() + " times " +
      "=> frequency is " + (value / numbers.length * 100).toFixed(3) + "%" + "<br/>");
  });
});
