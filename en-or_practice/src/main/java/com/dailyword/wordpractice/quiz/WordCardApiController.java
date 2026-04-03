package com.dailyword.wordpractice.quiz;

import com.dailyword.wordpractice.quiz.dto.ParseRequest;
import com.dailyword.wordpractice.quiz.dto.ParseResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class WordCardApiController {

    private final WordCardService wordCardService;

    public WordCardApiController(WordCardService wordCardService) {
        this.wordCardService = wordCardService;
    }

    @PostMapping("/parse")
    public ParseResponse parse(@Valid @RequestBody ParseRequest request) {
        return wordCardService.parse(request.content());
    }

    @GetMapping("/sample")
    public Map<String, String> sample() {
        return Map.of("content", wordCardService.getSampleData());
    }
}
