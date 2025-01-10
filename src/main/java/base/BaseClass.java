package base;

import java.io.FileInputStream;
import java.util.Properties;

public class BaseClass {

    public static FileInputStream fis;
    public static String propertiesFilePath;
    public static Properties props = new Properties();
    public String jtlFilePath = "results/LoadTest.jtl";
    public String jmxFilePath;
    public String modifiedJmxFilePath = "src/main/resources/ModifiedLoadTest.jmx";

    // Load Property file
    private static void loadPropFile() {
        propertiesFilePath = "src/main/resources/Config.properties";
        try {
            fis = new FileInputStream(propertiesFilePath);
            props.load(fis);
        } catch (Exception e) {
            System.out.println("Problem in loading file page");
            e.printStackTrace();
        }
    }

    // Read properties
    public static String getProperty(String key) {
        loadPropFile();
        return props.getProperty(key);
    }
}
