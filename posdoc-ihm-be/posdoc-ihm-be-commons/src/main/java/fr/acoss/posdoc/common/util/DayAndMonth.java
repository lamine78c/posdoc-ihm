package fr.acoss.posdoc.common.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DayAndMonth {
    private int month;
    private int day;

    @Override
    public boolean equals(Object obj) {
        if(!(obj instanceof DayAndMonth)) {
            return false;
        }
        DayAndMonth dayAndMonth = (DayAndMonth) obj;
        return this.getMonth() == dayAndMonth.getMonth() && this.getDay() == dayAndMonth.getDay();
    }

    @Override
    public int hashCode(){
        int hash = 17;
        hash = hash * 31 + this.month;
        hash = hash * 31 + this.day;
        return hash;
    }
}
