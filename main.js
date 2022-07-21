import fetch from 'node-fetch';
import "dotenv/config";
import { Parser } from 'json2csv';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';

const OPENAPI_KEY = process.env.OPENAPI_KEY;
let wholeData = [];

for(let i = 1; i < 100; i++){
    const url = `http://openapi.work.go.kr/opi/opi/opia/wantedApi.do?authKey=${OPENAPI_KEY}&callTp=L&returnType=XML&startPage=${i}&display=10`;
    const data = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/xml"
        },
    });
    const xmlData = await data.text();
    const parser = new XMLParser();
    const parsedData = parser.parse(xmlData);

    for(let z = 0; z < 10; z++){
        const wantedData = parsedData.wantedRoot.wanted[z];
        const wantedNo = parsedData.wantedRoot.wanted[z].wantedAuthNo;
        const urlDetail = `http://openapi.work.go.kr/opi/opi/opia/wantedApi.do?authKey=${OPENAPI_KEY}&callTp=D&returnType=XML&wantedAuthNo=${wantedNo}&infoSvc=VALIDATION`
        const dataDetail = await fetch(urlDetail, {
            method: "GET",
            headers: {
                Accept: "application/xml"
            },
        });
 
        const xmlDataDetail = await dataDetail.text();
        const parsedDataDetail = parser.parse(xmlDataDetail);
        const wantedDataDetail = parsedDataDetail.wantedDtl.corpInfo;
        
        const combinedData = Object.assign(wantedData, wantedDataDetail);
        wholeData.push(combinedData);
    }
}

const json2csvParser = new Parser();
const csvData = json2csvParser.parse(wholeData);

fs.writeFile('dataList.csv', csvData, 'utf8', function (err) {
    if (err) {
      console.log('error');
    } else{
      console.log('saved!');
    }
  });