package com.dailyword.wordpractice.quiz;

import com.dailyword.wordpractice.quiz.dto.ParseResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WordCardServiceTest {

    private final WordCardService wordCardService = new WordCardService();

    @Test
    void parseSkipsDuplicateLinesAndCollectsInvalidLines() {
        String content = """
            Organizing documents 서류를 정돈하다
            Organizing documents 서류를 정돈하다
            Looking out a window 창밖을 보다
            wrong line only english
            """;

        ParseResponse response = wordCardService.parse(content);

        assertThat(response.itemCount()).isEqualTo(2);
        assertThat(response.invalidCount()).isEqualTo(1);
        assertThat(response.items())
                .extracting(item -> item.english())
                .containsExactly("Organizing documents", "Looking out a window");
    }

    @Test
    void sampleDataContainsEnoughCards() {
        ParseResponse response = wordCardService.parse(wordCardService.getSampleData());

        assertThat(response.itemCount()).isGreaterThanOrEqualTo(10);
        assertThat(response.invalidCount()).isZero();
    }
}
