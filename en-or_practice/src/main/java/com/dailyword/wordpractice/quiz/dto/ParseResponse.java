package com.dailyword.wordpractice.quiz.dto;

import java.util.List;

public record ParseResponse(
        List<WordCardDto> items,
        List<InvalidLineDto> invalid,
        int itemCount,
        int invalidCount
) {
}
