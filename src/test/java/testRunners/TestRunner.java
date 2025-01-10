package testRunners;

import org.junit.runner.RunWith;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;

@RunWith(Cucumber.class)
@CucumberOptions(features = { "src/test/resources/features" }, plugin = { "pretty", "html:target/cucumber-reports",
        "json:target/cucumber.json" }, glue = { "stepDefinitions" })

public class TestRunner {
}
 