<div align="center">
<h1>OH MY GIRL CALENDAR API</h1>
</div>


## Usage

* GET https://ohmygirl.zerokr.xyz/api/calendar

들어가시면
```ts
type Member = "효정" | "유아" | "미미" | "승희" | "지호" | "비니" | "아린" | "OH MY GIRL"

interface Schedule {
    name: string
    members: Member[]
    timestamp: number
    date: Date
    content: string
}

interface Day {
    day: number
    schedules: Schedule[]
}

// returns
Day[]

// example
[
    {
        day: 1,
        schedules: [
            {
                name: "테스트 스케쥴",
                members: [
                    "OH MY GIRL"
                ],
                timestamp: 1607207781500,
                date: "2020-12-05T22:36:33.499Z",
                content: "테스트 스케쥴 (OH MY GIRL) - PM 3:00 ~"
            }
        ]
    }
]
```
식으로 돌아옵니다. 

아, 개발자가 아니라서 뭔 말인지 모르겠다고요? 

![screenshot.png](https://media.discordapp.net/attachments/745844596176715806/784941858677194822/unknown.png?width=1596&height=186)
![formatted.png](https://media.discordapp.net/attachments/745844596176715806/784943410707955712/unknown.png?width=368&height=732)

위와 같은 식으로 돌아옵니다.

## 스케쥴 캘린더를 달력 앱에 연동

### Synchronizer (스케쥴 달력 연동)

* [설치하기(iOS)](https://www.icloud.com/shortcuts/7a12fd8075e34d3982a82530c934ebdc)

### 달력 이벤트 제거 (필터는 본인이 직접 수정)

* [설치하기(iOS)](https://www.icloud.com/shortcuts/5c8d270f95184fffb0582f9c08737e3f)

## Contributions

### 버그, 수정 요청 등등

* [바로가기](https://github.com/zero734kr/ios-ohmygirl-calendar/issues)

### 수정 요청

할 일 없을때마다 틈틈히 짠거라 코드가 좀 스파게티라서 PR 넣어주시면 감사하겠습니다.

* [바로가기](https://github.com/zero734kr/ios-ohmygirl-calendar/pulls)

### 이 프로젝트가 마음에 든다면?

우측 상단의 Star 버튼을 눌러주세요!
