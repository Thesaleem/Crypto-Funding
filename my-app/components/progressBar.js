
export default function ProgressBar ({completed}) {

    const containerStyles = {
        height: 13,
        width: '100%',
        backgroundColor: '#e0e0de',
        borderRadius: 50,
    }
    const fillerStyle = {
        width: `${!completed ? '0' : completed}%`,
        height: '100%',
        backgroundColor: "#6a1b9a",
        borderRadius: 'inherit',
    }
    return (
        <div style={containerStyles} >
            <div className="" style={fillerStyle}></div>
        </div>
    )
}