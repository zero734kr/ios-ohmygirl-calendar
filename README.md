<div align="center">
<h1>OH MY GIRL CALENDAR API</h1>
</div>


## Usage

* GET https://ohmygirl.zerokr.xyz/api/calendar
  - Response: ``Day[]``
  
| Query Params | Type     | Optional | Default         | Description                                                        |
|--------------|----------|----------|-----------------|-----------------------------------------------------------------------------------------|
| timezone     | `string` | `true`   | `Asia/Seoul`    | Sets timezone of `Schedule#content` that should be one of supported timezones by MomentJS. |
| month        | `number` | `true`   | `current month` | Search by schedules on this month. Using with `year` query param is recommended.           |
| year         | `number` | `true`   | `current year`  | Search by schedules on this year. Using with `month` query param is recommended.           |

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

## Synchronizing with your iOS Calendar

### Calendar Synchronizer

* [Install Shortcut](https://www.icloud.com/shortcuts/7a12fd8075e34d3982a82530c934ebdc)

### Remove calendar events created by Synchronizer

* [Install Shortcut](https://www.icloud.com/shortcuts/5c8d270f95184fffb0582f9c08737e3f)

## Deploy your own

Deploy your own Oh My Girl API using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-typescript&project-name=with-typescript&repository-name=with-typescript)

* Copyright is still with me, [zero734kr](https://github.com/zero734kr). Please respect [LICENSE](https://github.com/zero734kr/ohmygirl-calendar-api/blob/master/LICENSE).

## Contributions

* [Issues](https://github.com/zero734kr/ios-ohmygirl-calendar/issues)
* [Pulls](https://github.com/zero734kr/ios-ohmygirl-calendar/pulls)

### Did you liked this project?

* Give a star for it!
