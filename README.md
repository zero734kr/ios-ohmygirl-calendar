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

아, 개발자가 아니라서 뭔 말인지 모르겠다고요? 그럼 그냥 들어가서 보시는게 더 이해에 빠를거에요.

## 스케쥴 캘린더를 달력 앱에 연동

### Synchronizer (스케쥴 달력 연동)

* [설치하기(iOS)](https://www.icloud.com/shortcuts/790a0c1fc08546bb8c7b3e5c922a80f9)

### 달력 이벤트 제거 (필터는 본인이 직접 수정)

* [설치하기(iOS)](https://www.icloud.com/shortcuts/5c8d270f95184fffb0582f9c08737e3f)
## FAQ
### 왜 만듬?

예, WM이 API 징원 안 해줘요. 그리고 단축어 앱을 이용해서 제 애플 달력 앱이랑 연동하려고요.

### 굳이?

우리 옴걸 스케쥴 다 따라가야죠 ㅎㅎ

### 코드 왜 이렇게 드러움?

할 일 없을때마다 틈틈히 한거라서 양해 좀요 ㅈㅅㅈㅅ

### 아무도 안 쓸거 같은데? 

제가 쓸겁니다.