# Soar - Flask App Performance Tests

This project is to check the performance of Flask App

## Getting Started

- ### Prerequisites
    - Java 8 and maven should be installed
    - Java and Maven Paths should be configured
    - Jmeter should be installed


## Setting the test data
- Go to feature file and give random data in Examples


## Installing dependencies

 ```
 mvn clean install
 ```

## Running the tests

 ```
 mvn test
 ```

## Reports

- Each run will create a new report folder under results folder. Open the report folder and open the index.html file to view the performance report as per given input

## NOTE
The project is made and run on MacOS, To run on windows machine, we have to change the path of jmeter in `jMeterIsSetUpForTheEndpoint` function in step definition file
