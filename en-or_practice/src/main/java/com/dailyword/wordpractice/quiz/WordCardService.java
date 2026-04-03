package com.dailyword.wordpractice.quiz;

import com.dailyword.wordpractice.quiz.dto.InvalidLineDto;
import com.dailyword.wordpractice.quiz.dto.ParseResponse;
import com.dailyword.wordpractice.quiz.dto.WordCardDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WordCardService {

    private static final Pattern HANGUL_PATTERN = Pattern.compile("[가-힣ㄱ-ㅎㅏ-ㅣ]");

    public String getSampleData() {
        return """
            Operating a computer 컴퓨터를 조작하다
            Arranging the chairs 의자를 배치하다
            Searching through some files 파일을 뒤지다
            Moving furniture 가구를 옮기다
            Typing on a keyboard 키보드를 치다
            Turning on a lamp 램프를 켜다
            Passing papers 서류를 전달하다
            Organizing documents 서류를 정돈하다
            Giving a presentation 발표하다
            Looking out a window 창밖을 보다
            Plugging[unplugging] a cord 코드를 꽂다
            Facing a screen 스크린을 마주보다
            Picking up a laptop 노트북 컴퓨터를 집어 들다
            Taking notes on paper 종이에 메모하다
            Filing receipts 영수증을 정리하다
            Reviewing a schedule 일정을 확인하다
            Opening the cabinet 캐비닛을 열다
            Carrying a box 상자를 옮기다
            Reading a report 보고서를 읽다
            Writing on a board 보드에 쓰다
            """.strip();
    }

    public ParseResponse parse(String content) {
        if (content == null || content.isBlank()) {
            return new ParseResponse(List.of(), List.of(), 0, 0);
        }

        List<WordCardDto> items = new ArrayList<>();
        List<InvalidLineDto> invalid = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        String[] lines = content.split("\\R");
        for (int index = 0; index < lines.length; index++) {
            String rawLine = lines[index];
            String line = rawLine == null ? "" : rawLine.trim();

            if (line.isEmpty() || line.startsWith("#") || line.startsWith("//")) {
                continue;
            }

            Matcher matcher = HANGUL_PATTERN.matcher(line);
            if (!matcher.find() || matcher.start() <= 0) {
                invalid.add(new InvalidLineDto(index + 1, line, "영어 뒤에 한국어 뜻이 있어야 합니다."));
                continue;
            }

            int hangulIndex = matcher.start();
            String english = cleanSpacing(line.substring(0, hangulIndex));
            String korean = cleanSpacing(line.substring(hangulIndex));

            if (english.isBlank() || korean.isBlank()) {
                invalid.add(new InvalidLineDto(index + 1, line, "영어와 한국어를 같이 적어 주세요."));
                continue;
            }

            String key = english + "|||" + korean;
            if (seen.contains(key)) {
                continue;
            }

            seen.add(key);
            items.add(new WordCardDto("card-" + (items.size() + 1), english, korean));
        }

        return new ParseResponse(List.copyOf(items), List.copyOf(invalid), items.size(), invalid.size());
    }

    private String cleanSpacing(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("\\s+", " ").trim();
    }
}
