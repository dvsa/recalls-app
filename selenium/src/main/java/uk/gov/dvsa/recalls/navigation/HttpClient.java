package uk.gov.dvsa.recalls.navigation;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.IOException;

import static org.apache.http.client.methods.RequestBuilder.head;

public class HttpClient {
    public static HttpResponse performHeadRequest(String uri) throws IOException {
        HttpUriRequest request = head(uri).build();

        try (CloseableHttpClient client = HttpClientBuilder.create().build()) {
            return client.execute(request);
        }
    }
}
