package com.dailyword.wordpractice.quiz.dto;

public record InvalidLineDto(
        int lineNo,
        String text,
        String reason
) {
}
