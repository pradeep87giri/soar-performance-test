package stepDefinitions;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.jmeter.engine.StandardJMeterEngine;
import org.apache.jmeter.reporters.ResultCollector;
import org.apache.jmeter.reporters.Summariser;
import org.apache.jmeter.save.SaveService;
import org.apache.jmeter.util.JMeterUtils;
import org.apache.jorphan.collections.HashTree;

import base.BaseClass;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import managers.PageObjectManager;
import pageObjects.FlaskApp;

public class Definitions extends BaseClass {
    PageObjectManager pageObjectManager = new PageObjectManager();
    FlaskApp flaskApp = pageObjectManager.getFlaskApp();
    StandardJMeterEngine jmeter;
    String jmxContent;
    int sampleCount;

    @Given("^JMeter is set up for the \"(.*)\" endpoint$")
    public void jMeterIsSetUpForTheEndpoint(String endpoint) {
        try {
            // Delete the .jtl file if it exists
            File jtlFile = new File(jtlFilePath);
            if (jtlFile.exists()) {
                if (jtlFile.delete()) {
                    System.out.println("Old results.jtl file deleted.");
                } else {
                    System.out.println("Failed to delete old results.jtl file.");
                }
            }

            // Initialize JMeter engine
            jmeter = new StandardJMeterEngine();

            // Set JMeter home and properties
            String jmeterHome = "/opt/homebrew/opt/jmeter/libexec";
            JMeterUtils.setJMeterHome(jmeterHome);
            JMeterUtils.loadJMeterProperties(jmeterHome + "/bin/jmeter.properties");
            JMeterUtils.initLocale();

            // Load the .jmx file
            if (endpoint.equals("/client_login")) {
                jmxFilePath = "src/main/resources/Login.jmx";
            } else if (endpoint.equals("/client_registeration")) {
                jmxFilePath = "src/main/resources/Registration.jmx";
            } else {
                throw new IllegalArgumentException("Invalid endpoint: " + endpoint);
            }
            // Replace placeholders with actual values
            jmxContent = new String(Files.readAllBytes(Paths.get(jmxFilePath)));
            jmxContent = jmxContent.replace("${endpoint}", endpoint);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("An error occurred while running the JMeter test.");
        }
    }

    @When("^Perform load testing with \"(.*)\" users, \"(.*)\" ramp time and \"(.*)\" loop count$")
    public void performLoadTesting(String users, String rampTime, String loops) {
        try {
            sampleCount = Integer.parseInt(users) * Integer.parseInt(loops);
            // Modify the .jmx file and save it
            jmxContent = jmxContent.replace("${numThreads}", String.valueOf(users));
            jmxContent = jmxContent.replace("${rampTime}", String.valueOf(rampTime));
            jmxContent = jmxContent.replace("${loops}", String.valueOf(loops));
            Files.write(Paths.get(modifiedJmxFilePath), jmxContent.getBytes());
            System.out.println("Modified .jmx file saved to: " + modifiedJmxFilePath);

            // Create .jtl file for reporting
            HashTree testPlanTree = SaveService.loadTree(new File(modifiedJmxFilePath));
            Summariser summariser = new Summariser("summary");
            ResultCollector resultCollector = new ResultCollector(summariser);
            resultCollector.setFilename(jtlFilePath);
            testPlanTree.add(testPlanTree.getArray()[0], resultCollector);

            // Run the test plan
            jmeter.configure(testPlanTree);
            jmeter.run();
            System.out.println("Test executed successfully! Results saved to: " + jtlFilePath);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("An error occurred while running the JMeter test.");
        }
    }

    @Then("^The report is saved$")
    public void saveReport() {
        try {
            // Ensure the results directory exists
            String resultsDir = "results";
            new File(resultsDir).mkdirs();

            // Generate a timestamp for the HTML report
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String htmlReportDir = resultsDir + "/report_" + String.valueOf(sampleCount) + "_samples_" + timestamp;

            // Command to generate the HTML report
            String command = String.format(
                    "jmeter -g %s -o %s",
                    jtlFilePath, htmlReportDir);

            // Execute the command
            Process process = Runtime.getRuntime().exec(command);
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                System.out.println("HTML report generated successfully at: " + htmlReportDir);
            } else {
                System.err.println("Failed to generate HTML report. Check the JMeter logs for details.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("An error occurred while generating the HTML report.");
        }
    }
}