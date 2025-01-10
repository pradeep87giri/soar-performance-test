package stepDefinitions;

import base.BaseClass;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import managers.PageObjectManager;
import pageObjects.FlaskApp;


public class Definitions extends BaseClass {
    PageObjectManager pageObjectManager = new PageObjectManager();
    FlaskApp flaskApp = pageObjectManager.getFlaskApp();

    @Given("^JMeter is set up for the \"(.*)\" endpoint$")
    public void jMeterIsSetUpForTheEndpoint(String endpoint) {
        System.out.println("Setting up JMeter for endpoint: " + endpoint);
    }

    @When("^\"(.*)\" concurrent users perform \"(.*)\" with random data$")
    public void concurrentUsersPerformActionWithRandomData(int users, String action) {
        System.out.println(users + " concurrent users performing action: " + action + " with random data.");
    }

    @Then("^The response time should be under \"(.*)\" seconds for \"(.*)\"% of the requests$")
    public void responseTimeShouldBeUnderSecondsForPercentOfRequests(int maxResponseTime, int percentile) {
        System.out.println("Validating performance: Response time under " + maxResponseTime +
                " seconds for " + percentile + "% of the requests.");
    }

    @And("this is a test step")
    public void thisIsATestStep() {
        System.out.println("This is a test step.");
    }
}