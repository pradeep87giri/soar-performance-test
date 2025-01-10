Feature: Performance testing for Flask App

  Scenario Outline: Load testing for Flask App endpoints
    Given JMeter is set up for the "<endpoint>" endpoint
    When Perform load testing with "<users>" users, "<rampTime>" ramp time and "<loopCount>" loop count
    Then The report is saved

    Examples:
      | endpoint              | users | rampTime | loopCount |
      | /client_registeration |    10 |        5 |        10 |
      | /client_registeration |     5 |        3 |         6 |
      | /client_login         |    20 |       10 |        15 |
