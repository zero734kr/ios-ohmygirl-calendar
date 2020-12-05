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
```
식으로 돌아옵니다. 

아, 개발자가 아니라서 뭔 말인지 모르겠다고요? 그럼 그냥 들어가서 보시는게 더 이해에 빠를거에요.

## Apple Shortcut to Sync Schedule Calendar to your phone

### 
## FAQ
### 왜 만듬?

예, WM이 API 징원 안 해줘요. 그리고 단축어 앱을 이용해서 제 애플 달력 앱이랑 연동하려고요.

### 굳이?

우리 옴걸 스케쥴 다 따라가야죠 ㅎㅎ

### 코드 왜 이렇게 드러움?

할 일 없을때마다 틈틈히 한거라서 양해 좀요 ㅈㅅㅈㅅ

### 아무도 안 쓸거 같은데? 

제가 쓸겁니다.