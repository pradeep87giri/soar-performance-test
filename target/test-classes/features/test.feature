Feature: Performance testing for Flask App

  Scenario Outline: Load testing for Flask App endpoints
    Given JMeter is set up for the "<endpoint>" endpoint
    When "<users>" concurrent users perform "<action>" with random data
    Then The response time should be under "<maxResponseTime>" seconds for "<percentile>"% of the requests

    Examples:
      | endpoint             | users | action       | maxResponseTime | percentile |
      | client_registeration |    10 | registration |               2 |         95 |
      | client_login         |    10 | login        |               2 |         95 |
