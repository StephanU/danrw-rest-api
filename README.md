A RESTful API to a DA-NRW (Digitales Archiv - Nordrhein-Westfalen) instance. The API intends to conform to the OAIS workflow. It has been tested using version "Oberntudorf 0.6.5-p1" of DA-NRW.

### Requirements

* node.js (http://nodejs.org/)
* DA-NRW (https://github.com/da-nrw)

### Installation

```bash
$ git clone https://github.com/StephanU/danrw-rest-api.git
$ cd danrw-rest-api
$ npm install
$ cp config.json.sample config.json
$ vi config.json # set configuration parameters according to the da-nrw installation
$ node index.js
```

### API prefix
The following prefix has to be prepended to all api urls.
  
```
/api/v1
```

Thus if starting the node process locally the final url would be:

```
http://localhost:3000/api/v1/<api path>
```

### IDs

Some api urls need IDs to refer to packages. The follwing IDs are supported.

| Name  | Type | Description |
| ----- | ---- | ----------- |
| identifier | string | The identifier of the ingested data generated by the DA-NRW<br>(e.g. "1-20141028174"). |
| urn | string  | The URN of the ingested data generated by the DA-NRW<br>(e.g. "urn:nbn:de:danrw-1-20141028174"). |
| origName | string | Original name of the ingested file<br>(e.g. "20141101 MyIngest.tgz"). |

### Authentication

All api urls require http basic authentication.

###API reference

#### Ingest data

```
POST /ingest
```

The file to ingest needs to be POSTed using the Content-Type multipart/form-data which allows the uploading of binary files.

##### Response

```
Status: 200 OK
```

##### Example URL
```
http://localhost:3000/api/v1/ingest
```

#### Get status of specific ingest

```
GET /ingest/:id
```

##### Parameters

":id" needs to be the value of one of the mentioned IDs.

##### Response

```
Status: 200 OK
```
```
{
    "result": [
        {
            "urn": "urn:nbn:de:danrw-1-20141028174",
            "contractor": "TEST",
            "origName": "20141028 Ingest Test 1",
            "identifier": "1-20141028174",
            "status": "in progress"
        }
    ]
}
```

##### Example URL
```
http://localhost:3000/api/v1/ingest/1-20141028174
```

#### Get list of all AIP

```
GET /archive
```

##### Response

```
Status: 200 OK
```
```
{
    "result": [
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-20141028182",
            "contractor": "TEST",
            "origName": "20141028 Ingest Test 2",
            "packages": [
                "1"
            ]
        },
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-20141016129",
            "contractor": "TEST",
            "origName": "20141016 Ingest Test 1",
            "packages": []
        },
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-20141016129",
            "contractor": "TEST",
            "origName": "20141016 Ingest Test 1",
            "packages": [
                "1"
            ]
        },
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-2014101581",
            "contractor": "TEST",
            "origName": "20141014 Ingest Test 1",
            "packages": []
        },
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-20141028196",
            "contractor": "TEST",
            "origName": "20141028 Ingest Test 3",
            "packages": []
        },
        {
            "status": "archived",
            "urn": "urn:nbn:de:danrw-1-20141028196",
            "contractor": "TEST",
            "origName": "20141028 Ingest Test 3",
            "packages": [
                "1"
            ]
        }
    ]
}
```

##### Example URL
```
http://localhost:3000/api/v1/archive
```

#### Order the dissemination of information

```
POST /order/:id
```

##### Parameters

":id" needs to be the value of one of the mentioned IDs.

##### Response

```
Status: 200 OK
```
```
{
  "success": true,
  "msg": "Objekt urn:nbn:de:danrw-1-20141028174 erfolgreich angefordert."
}
```

##### Example URL
```
http://localhost:3000/api/v1/order/1-20141028174
```

#### Get status of ordered dissemination of information

```
GET /order/:id
```

##### Parameters

":id" needs to be the value of one of the mentioned IDs.

##### Response

```
Status: 200 OK
```
```
[
    {
        "urn": "urn:nbn:de:danrw-1-20141016110",
        "contractor": "TEST",
        "origName": "20141016 Ingest Test 3",
        "identifier": "1-20141016110",
        "status": "in progress waiting : (950)",
        "statusCode": "950"
    }
]
```

##### Example URL
```
http://localhost:3000/api/v1/order/1-20141028174

```
#### Get list of finished ordered disseminations

```
GET /disseminate
```

##### Response

```
Status: 200 OK
```
```
[
    {
        "fileName": "20141014 Ingest Test 1.tgz"
    },
    {
        "fileName": "20141028 Ingest Test 1.tgz"
    },
    {
        "fileName": "20141028 Ingest Test 2.tgz"
    }
]
```

##### Example URL
```
http://localhost:3000/api/v1/disseminate
```

#### Disseminate information

```
GET /disseminate/:id
```

Binary download of information whose dissemination was previously ordered. The downloaed file is a gzipped tar archive (.tgz). The filename is given in the response header parameter 'Content-Disposition'.

##### Parameters

":id" needs to be the value of one of the ID 'identifier'.

##### Response

The ordered file will be returned as Content-Type 'application/octet-stream'.

##### Example URL
```
http://localhost:3000/api/v1/disseminate/1-20141028174
```

#### Query information

```
GET /query
```

Query the Fedora Commons repository of the DA-NRW. This is actually a proxy to the Fedora Commons installation.

##### Parameters

see https://wiki.duraspace.org/display/FEDORA35/REST+API

##### Response

```
Status: 200 OK
```

##### Example URL
```
http://localhost:3000/api/v1/query/objects/danrw:1-2014101368?format=xml
```
