package managers;

import pageObjects.FlaskApp;


public class PageObjectManager {
    private FlaskApp flaskApp;

    public FlaskApp getFlaskApp() {
        if (flaskApp == null) {
            flaskApp = new FlaskApp();
        }
        return flaskApp;
    }
}
