package com.dailyword.wordpractice.web;

import com.dailyword.wordpractice.quiz.WordCardService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final WordCardService wordCardService;

    public HomeController(WordCardService wordCardService) {
        this.wordCardService = wordCardService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "영어 퀴즈 & 플래시카드 메이커");
        model.addAttribute("pageDescription", "영어 + 한국어 뜻을 넣으면 퀴즈와 플래시카드 학습을 바로 할 수 있는 단어 연습 웹앱");
        model.addAttribute("sampleData", wordCardService.getSampleData());
        return "index";
    }
}
